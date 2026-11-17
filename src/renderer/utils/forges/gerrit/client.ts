import useSettingsStore from '../../../stores/useSettingsStore';

import type { Account, Hostname } from '../../../types';
import type { GerritAccountInfo, GerritChangeInfo, GerritServerVersionInfo } from './types';

import { isValidHostname } from '../../auth/identity';
import { decryptValue, sendGerritRequest } from '../../system/comms';

const PAGE_SIZE = 100;

/** Gerrit's JSON responses are prefixed with this XSSI-protection magic line, which must be stripped before parsing. */
const XSSI_PREFIX = ")]}'";

export function getGerritApiBaseUrl(hostname: Hostname): URL {
  if (!isValidHostname(hostname)) {
    throw new Error('Refusing to build a Gerrit API URL for invalid hostname.');
  }
  // The `/a/` prefix authenticates via HTTP Basic and also bypasses the need
  // for XSRF tokens on writes (see Gerrit REST API docs, "Authentication").
  return new URL(`https://${hostname}/a/`);
}

async function basicAuthorization(account: Account): Promise<string> {
  if (!account.username) {
    throw new Error('Gerrit account is missing username. Cannot build auth headers.');
  }
  const { token } = await decryptValue(account.token);
  return `Basic ${btoa(`${account.username}:${token}`)}`;
}

/**
 * Drop the response body from error messages — a misbehaving server can echo
 * the request (including the Authorization header) back, and that error
 * propagates to logs. `status` lets the shared classifier spot bad credentials.
 */
function apiError(status: number, statusText: string): Error & { status: number } {
  return Object.assign(new Error(`Gerrit API ${status} ${statusText}`), { status });
}

/** Strip the `)]}'` XSSI-protection prefix Gerrit prepends to every JSON response body. */
export function stripGerritXssiPrefix(text: string): string {
  return text.startsWith(XSSI_PREFIX) ? text.slice(XSSI_PREFIX.length) : text;
}

/**
 * Sent through the main process: Gerrit servers rarely allow the app's origin
 * via CORS, which packaged builds enforce. A JSON `body` makes it a POST.
 */
async function gerritRequest<T>(account: Account, pathname: string, body?: unknown): Promise<T> {
  const base = getGerritApiBaseUrl(account.hostname);
  const url = new URL(pathname.replace(/^\//, ''), base);

  const response = await sendGerritRequest({
    url: url.toString(),
    method: body === undefined ? 'GET' : 'POST',
    authorization: await basicAuthorization(account),
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status < 200 || response.status >= 300) {
    throw apiError(response.status, response.statusText);
  }
  if (!response.body) {
    return undefined as T;
  }

  return JSON.parse(stripGerritXssiPrefix(response.body)) as T;
}

function buildChangesQuery(start: number): string {
  const params = new URLSearchParams();
  // Attention Set is the only Gerrit mechanism with genuine per-user,
  // per-change server-side "needs action" state — the closest analogue to
  // an unread notification. See ForgeAdapter contract docs on `gerrit/adapter.ts`.
  //
  // Known scope limitation (accepted trade-off, not a bug): per Gerrit's own
  // rules ("If an active change is submitted, abandoned or reset to
  // 'work in progress', then all users are removed from the attention set" —
  // https://gerrit-review.googlesource.com/Documentation/user-attention-set.html#_rules),
  // reviewing a change already removes you from its attention set, and a
  // subsequent submit/merge by someone else clears it for everyone. So a
  // change you reviewed that later gets merged by another user will *not*
  // reappear here, even though Gerrit still emails you about the merge
  // (Gerrit's email notifications follow participation/watch settings, not
  // attention-set membership). Broadening the query to also catch this would
  // require synthesizing an expiring, non-server-backed "unread" state for
  // those entries — a deliberate design choice against for now, to keep
  // "mark as read" a real, honest server call for every notification this
  // adapter returns.
  params.set('q', 'attention:self');
  // Cheap (no extra round-trip): needed so `owner`/`attention_set` accounts
  // include name/username/email rather than just a numeric id.
  params.append('o', 'DETAILED_ACCOUNTS');
  params.set('n', String(PAGE_SIZE));
  if (start > 0) {
    params.set('S', String(start));
  }
  return params.toString();
}

export async function listGerritChanges(account: Account): Promise<GerritChangeInfo[]> {
  const query = buildChangesQuery(0);

  if (!useSettingsStore.getState().fetchAllNotifications) {
    return gerritRequest<GerritChangeInfo[]>(account, `changes/?${query}`);
  }

  const all: GerritChangeInfo[] = [];
  let start = 0;

  while (true) {
    const batch = await gerritRequest<GerritChangeInfo[]>(
      account,
      `changes/?${buildChangesQuery(start)}`,
    );
    if (!batch.length) {
      break;
    }
    all.push(...batch);
    const last = batch[batch.length - 1];
    if (!last._more_changes) {
      break;
    }
    start += batch.length;
  }

  return all;
}

export interface GerritAuthenticatedUserResult {
  account: GerritAccountInfo;
  /** `undefined` when the version endpoint could not be read (e.g. blocked by server config). */
  version: string | undefined;
}

export async function fetchGerritAuthenticatedUser(
  account: Account,
): Promise<GerritAuthenticatedUserResult> {
  const [accountInfo, version] = await Promise.all([
    gerritRequest<GerritAccountInfo>(account, 'accounts/self'),
    fetchGerritServerVersion(account),
  ]);

  return { account: accountInfo, version };
}

/**
 * Fetch the Gerrit server version string (e.g. "3.13.2").
 *
 * Resolves to `undefined` rather than rejecting when the endpoint is
 * unreachable — some servers restrict it, and an account whose version can't
 * be determined should not be hard-blocked from logging in.
 */
async function fetchGerritServerVersion(account: Account): Promise<string | undefined> {
  try {
    const info = await gerritRequest<GerritServerVersionInfo | string>(
      account,
      'config/server/version?verbose',
    );
    return typeof info === 'string' ? info : info?.gerrit_version;
  } catch {
    return undefined;
  }
}

/**
 * Remove the calling user from a change's attention set — Gerrit's closest
 * equivalent to "mark as read" (the change stops matching `attention:self`
 * on the next poll). Uses the `POST .../delete` alias rather than `DELETE`
 * with a body, which is more broadly compatible with HTTP clients/proxies.
 *
 * `changeId` must be a Gerrit `{change-id}` as returned by the API (e.g.
 * `ChangeInfo.id`, which is `RawGitifyNotification.id` for this adapter —
 * see `transform.ts`), i.e. `<project>~<_number>` with `project` *already*
 * URL-encoded by Gerrit itself. Do NOT `encodeURIComponent` it again here:
 * that would double-encode the `%` from an already-encoded `%2F` (nested
 * project name) into `%252F`, which Gerrit cannot resolve back to a real
 * project and 404s on.
 */
export async function removeSelfFromAttentionSet(
  account: Account,
  changeId: string,
  reason: string,
): Promise<void> {
  await gerritRequest<void>(account, `changes/${changeId}/attention/self/delete`, { reason });
}

/**
 * GET an arbitrary Gerrit URL returned by the API. The URL must point at the
 * same origin as the authenticated account — we never send credentials to a
 * different host.
 */
export async function gerritGetJson<T>(account: Account, url: string): Promise<T> {
  const expected = getGerritApiBaseUrl(account.hostname);
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('Refusing to follow malformed Gerrit URL.');
  }
  if (parsed.protocol !== 'https:' || parsed.host !== expected.host) {
    throw new Error(
      `Refusing to follow cross-origin Gerrit URL for account on ${account.hostname}.`,
    );
  }

  return gerritRequest<T>(account, parsed.toString());
}
