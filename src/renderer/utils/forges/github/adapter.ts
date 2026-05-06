import { KeyIcon, MarkGithubIcon, PersonIcon } from '@primer/octicons-react';

import { Constants } from '../../../constants';

import type {
  Account,
  GitifyNotification,
  Hostname,
  Link,
  SettingsState,
  Token,
} from '../../../types';
import type { ForgeAdapter, RefreshAccountData } from '../types';

import {
  getDeveloperSettingsURL as legacyGetDeveloperSettingsURL,
  getNewTokenURL as legacyGetNewTokenURL,
  isValidToken as legacyIsValidToken,
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
import { createOctokitClient } from './octokit';
import { transformNotifications } from './transform';

async function fetchAuthenticatedUser(
  account: Account,
): Promise<RefreshAccountData> {
  const response = await fetchAuthenticatedUserDetails(account);
  return {
    data: response.data as RefreshAccountData['data'],
    headers: response.headers as RefreshAccountData['headers'],
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

  followUrl,

  defaultHostname: Constants.GITHUB_HOSTNAME,
  validateToken: (token: Token) => legacyIsValidToken(token),
  getPersonalAccessTokenSettingsUrl: (hostname: Hostname) =>
    legacyGetNewTokenURL(hostname),
  getDeveloperSettingsUrl: (account: Account) =>
    legacyGetDeveloperSettingsURL(account),
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
