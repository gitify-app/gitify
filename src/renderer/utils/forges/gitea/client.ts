import type { Account, Hostname, SettingsState } from '../../../types';
import type { GiteaNotificationThread, GiteaUser } from './types';

import { decryptValue } from '../../system/comms';

const PAGE_SIZE = 100;

export function getGiteaApiBaseUrl(hostname: Hostname): URL {
  return new URL(`https://${hostname}/api/v1/`);
}

async function authHeaders(account: Account): Promise<HeadersInit> {
  const token = await decryptValue(account.token);
  return {
    Accept: 'application/json',
    Authorization: `token ${token}`,
  };
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

export function fetchGiteaAuthenticatedUser(account: Account): Promise<GiteaUser> {
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

export async function giteaGetJson<T>(
  account: Account,
  url: string,
): Promise<T> {
  const response = await fetch(url, {
    headers: await authHeaders(account),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Gitea API ${response.status} ${response.statusText}: ${text.slice(0, 200)}`,
    );
  }
  return response.json() as Promise<T>;
}
