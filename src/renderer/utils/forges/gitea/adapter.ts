import { KeyIcon, ServerIcon } from '@primer/octicons-react';

import type {
  Account,
  GitifyNotification,
  Hostname,
  Link,
  SettingsState,
  Token,
} from '../../../types';
import type {
  ForgeAdapter,
  ForgeCapabilities,
  RefreshAccountData,
} from '../types';

import {
  fetchGiteaAuthenticatedUser,
  giteaGetJson,
  listGiteaNotifications,
  patchGiteaNotificationThread,
} from './client';
import { transformGiteaNotifications } from './transform';

const GITEA_DOCS_URL = 'https://docs.gitea.com/development/api-usage' as Link;

const capabilities: ForgeCapabilities = {
  markAsDone: () => false,
  unsubscribeThread: () => false,
  enrichment: () => false,
  answeredDiscussion: () => false,
};

async function fetchAuthenticatedUser(
  account: Account,
): Promise<RefreshAccountData> {
  const user = await fetchGiteaAuthenticatedUser(account);
  return {
    data: {
      id: user.id,
      login: user.login,
      name: user.full_name ?? null,
      avatar_url: user.avatar_url ?? '',
    },
    headers: {},
  };
}

async function listNotifications(
  account: Account,
  settings: SettingsState,
): Promise<GitifyNotification[]> {
  const raw = await listGiteaNotifications(account, settings);
  return transformGiteaNotifications(raw, account);
}

function unsupported(action: string): never {
  throw new Error(`${action} is not supported for Gitea accounts.`);
}

export const giteaAdapter: ForgeAdapter = {
  id: 'gitea',
  displayName: 'Gitea',
  icon: ServerIcon,
  capabilities,

  fetchAuthenticatedUser,
  listNotifications,

  markThreadAsRead: (account, threadId) =>
    patchGiteaNotificationThread(account, threadId, 'read'),
  markThreadAsDone: (account, threadId) =>
    patchGiteaNotificationThread(account, threadId, 'read'),
  unsubscribeThread: () => unsupported('Ignoring thread subscriptions'),

  followUrl<T>(account: Account, url: Link): Promise<T> {
    return giteaGetJson<T>(account, url);
  },

  validateToken: (token: Token) =>
    token.length >= 8 && token.length <= 512 && !/[\r\n]/.test(token),
  getPersonalAccessTokenSettingsUrl: (hostname: Hostname) =>
    `https://${hostname}/user/settings/applications` as Link,
  getDeveloperSettingsUrl: (account: Account) =>
    `https://${account.hostname}/user/settings/applications` as Link,
  documentationUrl: GITEA_DOCS_URL,

  loginMethods: [
    {
      testId: 'login-gitea-pat',
      icon: KeyIcon,
      label: 'Personal Access Token',
      route: '/login-personal-access-token',
      state: { forge: 'gitea' },
    },
  ],

  // Gitea has no GitHub-style OAuth scope concept; treat any token as fully
  // scoped so the recommended/alternate UI prompts never surface for Gitea.
  hasRequiredScopes: () => true,
  hasRecommendedScopes: () => true,
  hasAlternateScopes: () => true,
};
