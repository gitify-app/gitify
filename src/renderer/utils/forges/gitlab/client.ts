import useSettingsStore from '../../../stores/useSettingsStore';

import type { Account, Hostname } from '../../../types';
import type {
  GitLabPersonalAccessToken,
  GitLabTodo,
  GitLabTodoState,
  GitLabUser,
  GitLabVersion,
} from './types';

import { isValidHostname } from '../../auth/utils';
import { decryptValue } from '../../system/comms';

const PAGE_SIZE = 100;

export function getGitLabApiBaseUrl(hostname: Hostname): URL {
  if (!isValidHostname(hostname)) {
    throw new Error('Refusing to build a GitLab API URL for invalid hostname.');
  }
  return new URL(`https://${hostname}/api/v4/`);
}

async function authHeaders(account: Account): Promise<HeadersInit> {
  const { token } = await decryptValue(account.token);
  return {
    Accept: 'application/json',
    'PRIVATE-TOKEN': token,
  };
}

/**
 * Drop the response body from error messages — a misbehaving server can echo
 * the request (including the PRIVATE-TOKEN header) back, and that error
 * propagates to logs.
 */
function apiError(status: number, statusText: string): Error {
  return new Error(`GitLab API ${status} ${statusText}`);
}

async function gitlabRequest<T>(
  account: Account,
  pathname: string,
  init?: RequestInit,
): Promise<T> {
  const base = getGitLabApiBaseUrl(account.hostname);
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

async function listTodosForState(account: Account, state: GitLabTodoState): Promise<GitLabTodo[]> {
  const params = new URLSearchParams();
  params.set('per_page', String(PAGE_SIZE));
  params.set('state', state);

  if (!useSettingsStore.getState().fetchAllNotifications) {
    params.set('page', '1');
    return gitlabRequest<GitLabTodo[]>(account, `todos?${params.toString()}`);
  }

  const all: GitLabTodo[] = [];
  let page = 1;

  while (true) {
    params.set('page', String(page));
    const batch = await gitlabRequest<GitLabTodo[]>(account, `todos?${params.toString()}`);
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

/**
 * List to-do items, optionally including already-completed ones.
 *
 * GitLab has no read/unread axis: an item is `pending` until it is marked
 * `done`. "Fetch read notifications" therefore maps to also requesting done
 * items, which needs a second request because `state` accepts a single value.
 */
export async function listGitLabTodos(account: Account): Promise<GitLabTodo[]> {
  const pending = await listTodosForState(account, 'pending');

  if (!useSettingsStore.getState().fetchReadNotifications) {
    return pending;
  }

  const done = await listTodosForState(account, 'done');
  return [...pending, ...done];
}

export function fetchGitLabAuthenticatedUser(account: Account): Promise<GitLabUser> {
  return gitlabRequest<GitLabUser>(account, 'user');
}

export function fetchGitLabVersion(account: Account): Promise<GitLabVersion> {
  return gitlabRequest<GitLabVersion>(account, 'version');
}

export function fetchGitLabTokenMetadata(account: Account): Promise<GitLabPersonalAccessToken> {
  return gitlabRequest<GitLabPersonalAccessToken>(account, 'personal_access_tokens/self');
}

/**
 * Mark a single to-do item as done.
 *
 * GitLab exposes exactly one state transition for a to-do item, so this backs
 * both "mark as read" and "mark as done" in the adapter.
 */
export async function markGitLabTodoAsDone(account: Account, todoId: string): Promise<void> {
  await gitlabRequest<void>(account, `todos/${todoId}/mark_as_done`, {
    method: 'POST',
  });
}

/**
 * GET an arbitrary GitLab URL returned by the API (e.g. `target_url`). The URL
 * must point at the same origin as the authenticated account — we never send
 * the token to a different host.
 */
export async function gitlabGetJson<T>(account: Account, url: string): Promise<T> {
  const expected = getGitLabApiBaseUrl(account.hostname);
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('Refusing to follow malformed GitLab URL.');
  }
  if (parsed.protocol !== 'https:' || parsed.host !== expected.host) {
    throw new Error(
      `Refusing to follow cross-origin GitLab URL for account on ${account.hostname}.`,
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
