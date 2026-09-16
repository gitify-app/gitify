import {
  AppsIcon,
  KeyIcon,
  MarkGithubIcon,
  PersonIcon,
  TerminalIcon,
} from '@primer/octicons-react';

import { Constants, OAUTH_SCOPE } from '../../../constants';

import type { Account, Link, RawGitifyNotification } from '../../../types';
import type { AuthMethod } from '../../auth/types';
import type { ForgeAdapter, NotificationDisplayHelpers, RefreshAccountData } from '../types';

import {
  extractHostVersion,
  getDeveloperSettingsURL,
  getNewOAuthAppURL,
  getNewTokenURL,
  isValidClientId,
  isValidToken,
} from './auth';
import { githubCapabilities } from './capabilities';
import { forgetGitHubCliToken, resolveGitHubCliToken } from './cli';
import {
  fetchAuthenticatedUserDetails,
  ignoreNotificationThreadSubscription,
  listNotificationsForAuthenticatedUser,
  markNotificationThreadAsDone,
  markNotificationThreadAsRead,
} from './client';
import { enrichGitHubNotifications } from './enrich';
import {
  exchangeAuthCodeForAccessToken,
  performGitHubWebOAuth,
  pollGitHubDeviceFlow,
  startGitHubDeviceFlow,
} from './flows';
import { createNotificationHandler } from './handlers';
import { clearOctokitClientCacheForAccount, createOctokitClient } from './octokit';
import { getGitHubPlatform } from './platform';
import { transformNotifications } from './transform';
import { formatGitHubNotificationUser } from './users';

async function fetchAuthenticatedUser(account: Account): Promise<RefreshAccountData> {
  if (account.method === 'GitHub CLI') {
    // Re-read the CLI so a `gh auth refresh` that widened the token's scopes is
    // reflected here; a merely rotated token is handled per request.
    forgetGitHubCliToken(account.hostname);
  }

  const response = await fetchAuthenticatedUserDetails(account);
  const user = response.data;
  const headers = response.headers as Record<string, string | undefined>;

  const scopes = headers['x-oauth-scopes']?.split(',').map((scope) => scope.trim());

  return {
    user: {
      id: String(user.id),
      login: user.login,
      name: user.name ?? null,
      avatar: user.avatar_url ?? '',
    },
    version: extractHostVersion(headers['x-github-enterprise-version'] ?? null),
    scopes,
  };
}

async function listNotifications(account: Account): Promise<RawGitifyNotification[]> {
  const raw = await listNotificationsForAuthenticatedUser(account);
  return transformNotifications(raw, account);
}

async function followUrl<T>(account: Account, url: Link): Promise<T> {
  const octokit = await createOctokitClient(account, 'rest');
  const response = await octokit.request('GET {+url}', { url });
  return response.data as T;
}

function getDisplayHelpers(notification: RawGitifyNotification): NotificationDisplayHelpers {
  const handler = createNotificationHandler(notification);
  return {
    iconType: handler.iconType(notification),
    iconColor: handler.iconColor(notification),
    defaultUrl: handler.defaultUrl(notification),
    defaultUserType: handler.defaultUserType(),
  };
}

export const githubAdapter: ForgeAdapter = {
  id: 'github',
  displayName: 'GitHub',
  tagline: 'GitHub Cloud & GitHub Enterprise Server',
  icon: MarkGithubIcon,

  getPlatform: getGitHubPlatform,
  formatUserLogin: (login) => login,

  enrichNotifications: enrichGitHubNotifications,
  getDisplayHelpers,

  defaultHostname: Constants.GITHUB_HOSTNAME,
  validateToken: isValidToken,
  getPersonalAccessTokenSettingsUrl: getNewTokenURL,
  documentationUrl: Constants.GITHUB_DOCS.PAT_URL as Link,
  getAuthMethodIcon: githubAuthMethodIcon,

  loginMethods: [
    {
      testId: 'login-github',
      icon: MarkGithubIcon,
      label: 'GitHub',
      variant: 'primary',
      route: '/login/github/device-flow',
      authMethod: 'GitHub App',
    },
    {
      testId: 'login-pat',
      icon: KeyIcon,
      label: 'Personal Access Token',
      route: '/login/github/personal-access-token',
      authMethod: 'Personal Access Token',
    },
    {
      testId: 'login-github-cli',
      icon: TerminalIcon,
      label: 'GitHub CLI',
      route: '/login/github/cli',
      authMethod: 'GitHub CLI',
    },
    {
      testId: 'login-oauth-app',
      icon: PersonIcon,
      label: 'OAuth App',
      route: '/login/github/oauth-app',
      authMethod: 'OAuth App',
    },
  ],

  deviceFlow: {
    authMethod: 'GitHub App',
    start: startGitHubDeviceFlow,
    poll: pollGitHubDeviceFlow,
    getRevokeAccessUrl: (hostname) =>
      getDeveloperSettingsURL({ hostname, method: 'GitHub App' } as Account),
  },

  oauthWebApp: {
    performWebOAuth: performGitHubWebOAuth,
    exchangeAuthCodeForToken: exchangeAuthCodeForAccessToken,
    validateClientId: isValidClientId,
    getNewOAuthAppUrl: getNewOAuthAppURL,
  },

  cliAuth: {
    authMethod: 'GitHub CLI',
    resolveToken: resolveGitHubCliToken,
  },

  accountOps: {
    capabilities: githubCapabilities,
    formatNotificationUser: formatGitHubNotificationUser,
    fetchAuthenticatedUser,
    onAccountTokenChange: (account) => {
      clearOctokitClientCacheForAccount(account);
      forgetGitHubCliToken(account.hostname);
    },
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
    followUrl,
    getAccountSettingsUrl: getDeveloperSettingsURL,
    getIssuesUrl: (account) => `https://${account.hostname}/issues` as Link,
    getPullRequestsUrl: (account) => `https://${account.hostname}/pulls` as Link,
    getNotificationsUrl: (account) => `https://${account.hostname}/notifications` as Link,
    oauthScopes: {
      hasRequired: (account) => accountHasScopes(account, 'REQUIRED'),
      hasRecommended: (account) => accountHasScopes(account, 'RECOMMENDED'),
      hasAlternate: (account) => accountHasScopes(account, 'ALTERNATE'),
      externallyManaged: (account) =>
        account.method === 'GitHub CLI'
          ? {
              label: 'Managed by the GitHub CLI',
              detail: 'The repo scope grants notification access.',
              command: 'gh auth refresh -s notifications',
            }
          : undefined,
    },
  },
};

function accountHasScopes(
  account: Account,
  group: 'REQUIRED' | 'RECOMMENDED' | 'ALTERNATE',
): boolean {
  const scopes = account.scopes ?? [];

  if (account.method === 'GitHub CLI') {
    // `gh` issues a fixed scope set Gitify cannot widen, and its `repo` scope
    // already grants the notifications API, so judge these accounts on
    // notification access rather than the scope names a PAT would be asked
    // for. `gh auth token` can also return a `GH_TOKEN` the user exported,
    // which may be any PAT, so the narrower tiers stay meaningful.
    const canReadNotifications =
      scopes.includes(OAUTH_SCOPE.NOTIFICATIONS.name) || scopes.includes(OAUTH_SCOPE.REPO.name);

    if (group === 'RECOMMENDED') {
      return scopes.includes(OAUTH_SCOPE.REPO.name);
    }

    if (group === 'ALTERNATE') {
      return canReadNotifications && scopes.includes(OAUTH_SCOPE.PUBLIC_REPO.name);
    }

    return canReadNotifications;
  }

  return Constants.OAUTH_SCOPES[group].every(({ name }) => scopes.includes(name));
}

function githubAuthMethodIcon(method: AuthMethod) {
  switch (method) {
    case 'GitHub App':
      return AppsIcon;
    case 'GitHub CLI':
      return TerminalIcon;
    case 'OAuth App':
      return PersonIcon;
    default:
      return KeyIcon;
  }
}
