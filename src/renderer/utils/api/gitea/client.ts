import type { Account, SettingsState } from '../../../types';
import type { GiteaNotificationThread, GiteaUser } from './types';

import { decryptValue } from '../../system/comms';
import { getGiteaApiBaseUrl } from './utils';

async function giteaRequest<T>(
  account: Account,
  pathname: string,
  init?: RequestInit,
): Promise<T> {
  const token = await decryptValue(account.token);
  const base = getGiteaApiBaseUrl(account.hostname);
  const url = new URL(pathname.replace(/^\//, ''), base);

  const response = await fetch(url.toString(), {
    ...init,
    headers: {
      Accept: 'application/json',
      Authorization: `token ${token}`,
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Gitea API ${response.status} ${response.statusText}: ${text.slice(0, 200)}`,
    );
  }

  if (response.status === 204 || response.status === 205) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function buildNotificationQuery(settings: SettingsState): string {
  const params = new URLSearchParams();
  params.set('limit', '100');

  const statusTypes: string[] = settings.fetchReadNotifications
    ? ['unread', 'read']
    : ['unread'];

  for (const s of statusTypes) {
    params.append('status-types', s);
  }

  return params.toString();
}

/**
 * List notification threads for the authenticated user (paginated when requested).
 */
export async function listGiteaNotificationsForAuthenticatedUser(
  account: Account,
  settings: SettingsState,
): Promise<GiteaNotificationThread[]> {
  const query = buildNotificationQuery(settings);
  const firstPath = `notifications?${query}&page=1`;

  if (!settings.fetchAllNotifications) {
    return giteaRequest<GiteaNotificationThread[]>(account, firstPath);
  }

  const all: GiteaNotificationThread[] = [];
  let page = 1;

  while (true) {
    const path = `notifications?${query}&page=${String(page)}`;
    const batch = await giteaRequest<GiteaNotificationThread[]>(account, path);
    if (!batch.length) {
      break;
    }
    all.push(...batch);
    if (batch.length < 100) {
      break;
    }
    page += 1;
  }

  return all;
}

/**
 * GET /user — current user profile.
 */
export async function fetchGiteaAuthenticatedUser(
  account: Account,
): Promise<GiteaUser> {
  return giteaRequest<GiteaUser>(account, 'user');
}

/**
 * PATCH /notifications/threads/{id} — mark thread (e.g. read).
 */
export async function patchGiteaNotificationThread(
  account: Account,
  threadId: string,
  toStatus: 'read' | 'unread' | 'pinned' = 'read',
): Promise<void> {
  const params = new URLSearchParams();
  params.set('to-status', toStatus);
  await giteaRequest<void>(
    account,
    `notifications/threads/${threadId}?${params.toString()}`,
    { method: 'PATCH' },
  );
}

/**
 * Generic GET for an API URL returned by Gitea (e.g. subject URL).
 */
export async function giteaGetJson<T>(
  account: Account,
  url: string,
): Promise<T> {
  const token = await decryptValue(account.token);
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      Authorization: `token ${token}`,
    },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Gitea API ${response.status} ${response.statusText}: ${text.slice(0, 200)}`,
    );
  }
  return response.json() as Promise<T>;
}
