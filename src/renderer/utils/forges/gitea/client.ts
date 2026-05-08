import type { Account, Hostname, SettingsState } from '../../../types';
import type { GiteaNotificationThread, GiteaUser } from './types';

import { isValidHostname } from '../../auth/utils';
import { decryptValue } from '../../system/comms';

const PAGE_SIZE = 100;

export function getGiteaApiBaseUrl(hostname: Hostname): URL {
  if (!isValidHostname(hostname)) {
    throw new Error('Refusing to build a Gitea API URL for invalid hostname.');
  }
  return new URL(`https://${hostname}/api/v1/`);
}

async function authHeaders(account: Account): Promise<HeadersInit> {
  const { token } = await decryptValue(account.token);
  return {
    Accept: 'application/json',
    Authorization: `token ${token}`,
  };
}

/**
 * Drop the response body from error messages — a misbehaving server can echo
 * the request (including the Authorization header) back, and that error
 * propagates to logs.
 */
function apiError(status: number, statusText: string): Error {
  return new Error(`Gitea API ${status} ${statusText}`);
}

async function giteaRequest<T>(
  account: Account,
  pathname: string,
  init?: RequestInit,
): Promise<T> {
  const base = getGiteaApiBaseUrl(account.hostname);
  const url = new URL(pathname.replace(/^\//, ''), base);

  const response = await fetch(url.toString(), {
    ...init,
    headers: {
      ...(await authHeaders(account)),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw apiError(response.status, response.statusText);
  }

  if (response.status === 204 || response.status === 205) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function buildNotificationQuery(settings: SettingsState): string {
  const params = new URLSearchParams();
  params.set('limit', String(PAGE_SIZE));

  const statusTypes = settings.fetchReadNotifications
    ? ['unread', 'read']
    : ['unread'];

  for (const status of statusTypes) {
    params.append('status-types', status);
  }

  return params.toString();
}

export async function listGiteaNotifications(
  account: Account,
  settings: SettingsState,
): Promise<GiteaNotificationThread[]> {
  const query = buildNotificationQuery(settings);

  if (!settings.fetchAllNotifications) {
    return giteaRequest<GiteaNotificationThread[]>(
      account,
      `notifications?${query}&page=1`,
    );
  }

  const all: GiteaNotificationThread[] = [];
  let page = 1;

  while (true) {
    const batch = await giteaRequest<GiteaNotificationThread[]>(
      account,
      `notifications?${query}&page=${String(page)}`,
    );
    if (!batch.length) {
      break;
    }
    all.push(...batch);
    if (batch.length < PAGE_SIZE) {
      break;
    }
    page += 1;
  }

  return all;
}

export function fetchGiteaAuthenticatedUser(
  account: Account,
): Promise<GiteaUser> {
  return giteaRequest<GiteaUser>(account, 'user');
}

export async function patchGiteaNotificationThread(
  account: Account,
  threadId: string,
  toStatus: 'read' | 'unread' | 'pinned' = 'read',
): Promise<void> {
  const params = new URLSearchParams({ 'to-status': toStatus });
  await giteaRequest<void>(
    account,
    `notifications/threads/${threadId}?${params.toString()}`,
    { method: 'PATCH' },
  );
}

/**
 * GET an arbitrary Gitea URL returned by the API (e.g. `subject.url`,
 * `latest_comment_url`). The URL must point at the same origin as the
 * authenticated account — we never send the PAT to a different host.
 */
export async function giteaGetJson<T>(
  account: Account,
  url: string,
): Promise<T> {
  const expected = getGiteaApiBaseUrl(account.hostname);
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('Refusing to follow malformed Gitea URL.');
  }
  if (parsed.protocol !== 'https:' || parsed.host !== expected.host) {
    throw new Error(
      `Refusing to follow cross-origin Gitea URL for account on ${account.hostname}.`,
    );
  }

  const response = await fetch(parsed.toString(), {
    headers: await authHeaders(account),
  });
  if (!response.ok) {
    throw apiError(response.status, response.statusText);
  }
  return response.json() as Promise<T>;
}
