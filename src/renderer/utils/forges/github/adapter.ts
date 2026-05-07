import { KeyIcon, MarkGithubIcon, PersonIcon } from '@primer/octicons-react';

import { Constants } from '../../../constants';

import type {
  Account,
  GitifyNotification,
  Link,
  SettingsState,
} from '../../../types';
import type { ForgeAdapter, RefreshAccountData } from '../types';

import {
  extractHostVersion,
  getDeveloperSettingsURL,
  getNewTokenURL,
  isValidToken,
} from '../../auth/utils';
import { githubCapabilities } from './capabilities';
import {
  fetchAuthenticatedUserDetails,
  ignoreNotificationThreadSubscription,
  listNotificationsForAuthenticatedUser,
  markNotificationThreadAsDone,
  markNotificationThreadAsRead,
} from './client';
import { enrichGitHubNotifications } from './enrich';
import {
  clearOctokitClientCacheForAccount,
  createOctokitClient,
} from './octokit';
import { transformNotifications } from './transform';

async function fetchAuthenticatedUser(
  account: Account,
): Promise<RefreshAccountData> {
  const response = await fetchAuthenticatedUserDetails(account);
  const user = response.data;
  const headers = response.headers as Record<string, string | undefined>;

  const scopes = headers['x-oauth-scopes']
    ?.split(',')
    .map((scope) => scope.trim());

  return {
    user: {
      id: String(user.id),
      login: user.login,
      name: user.name ?? null,
      avatar: user.avatar_url ?? '',
    },
    version: extractHostVersion(
      headers['x-github-enterprise-version'] ?? null,
    ),
    scopes,
  };
}

async function listNotifications(
  account: Account,
  settings: SettingsState,
): Promise<GitifyNotification[]> {
  const raw = await listNotificationsForAuthenticatedUser(account, settings);
  return transformNotifications(raw, account);
}

async function followUrl<T>(account: Account, url: Link): Promise<T> {
  const octokit = await createOctokitClient(account, 'rest');
  const response = await octokit.request('GET {+url}', { url });
  return response.data as T;
}

export const githubAdapter: ForgeAdapter = {
  id: 'github',
  displayName: 'GitHub',
  icon: MarkGithubIcon,
  capabilities: githubCapabilities,

  fetchAuthenticatedUser,
  listNotifications,

  markThreadAsRead: async (account, threadId) => {
    await markNotificationThreadAsRead(account, threadId);
  },
  markThreadAsDone: async (account, threadId) => {
    await markNotificationThreadAsDone(account, threadId);
  },
  unsubscribeThread: async (account, threadId) => {
    await ignoreNotificationThreadSubscription(account, threadId);
  },

  enrichNotifications: enrichGitHubNotifications,
  onAccountTokenChange: clearOctokitClientCacheForAccount,

  followUrl,

  defaultHostname: Constants.GITHUB_HOSTNAME,
  validateToken: isValidToken,
  getPersonalAccessTokenSettingsUrl: getNewTokenURL,
  getDeveloperSettingsUrl: getDeveloperSettingsURL,
  documentationUrl: Constants.GITHUB_DOCS.PAT_URL as Link,

  loginMethods: [
    {
      testId: 'login-github',
      icon: MarkGithubIcon,
      label: 'GitHub',
      variant: 'primary',
      route: '/login-device-flow',
    },
    {
      testId: 'login-pat',
      icon: KeyIcon,
      label: 'Personal Access Token',
      route: '/login-personal-access-token',
    },
    {
      testId: 'login-oauth-app',
      icon: PersonIcon,
      label: 'OAuth App',
      route: '/login-oauth-app',
    },
  ],

  hasRequiredScopes: (account) => accountHasScopes(account, 'REQUIRED'),
  hasRecommendedScopes: (account) => accountHasScopes(account, 'RECOMMENDED'),
  hasAlternateScopes: (account) => accountHasScopes(account, 'ALTERNATE'),
};

function accountHasScopes(
  account: Account,
  group: 'REQUIRED' | 'RECOMMENDED' | 'ALTERNATE',
): boolean {
  return Constants.OAUTH_SCOPES[group].every(({ name }) =>
    (account.scopes ?? []).includes(name),
  );
}
