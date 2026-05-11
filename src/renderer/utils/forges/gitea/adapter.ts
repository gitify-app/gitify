import { KeyIcon, ServerIcon } from '@primer/octicons-react';

import type {
  Account,
  Hostname,
  Link,
  RawGitifyNotification,
  SettingsState,
  Token,
} from '../../../types';
import type {
  ForgeAdapter,
  ForgeCapabilities,
  NotificationDisplayHelpers,
  RefreshAccountData,
} from '../types';

import { createNotificationHandler } from '../github/handlers';
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
};

async function fetchAuthenticatedUser(account: Account): Promise<RefreshAccountData> {
  const user = await fetchGiteaAuthenticatedUser(account);
  return {
    user: {
      id: String(user.id),
      login: user.login,
      name: user.full_name ?? null,
      avatar: user.avatar_url ?? '',
    },
  };
}

async function listNotifications(
  account: Account,
  settings: SettingsState,
): Promise<RawGitifyNotification[]> {
  const raw = await listGiteaNotifications(account, settings);
  return transformGiteaNotifications(raw, account);
}

// Gitea reuses GitHub's notification-type handler dispatch for display
// helpers. The dispatch is keyed on `subject.type` (Issue / PullRequest /
// Commit) which Gitea's transform produces in the same vocabulary, so the
// icon/color/url logic applies cleanly. Routing it through the adapter keeps
// shared formatting code (`formatters.ts`, `url.ts`) forge-agnostic.
function getDisplayHelpers(notification: RawGitifyNotification): NotificationDisplayHelpers {
  const handler = createNotificationHandler(notification);
  return {
    iconType: handler.iconType(notification),
    iconColor: handler.iconColor(notification),
    defaultUrl: handler.defaultUrl(notification),
    defaultUserType: handler.defaultUserType(),
  };
}

export const giteaAdapter: ForgeAdapter = {
  id: 'gitea',
  displayName: 'Gitea',
  tagline: 'Gitea, Forgejo & Codeberg',
  icon: ServerIcon,
  capabilities,

  fetchAuthenticatedUser,
  listNotifications,

  markThreadAsRead: (account, threadId) => patchGiteaNotificationThread(account, threadId, 'read'),
  // Gitea has no "done" state — capability `markAsDone(account)` returns
  // false so the UI gates this off. Throwing rather than silently aliasing to
  // markThreadAsRead surfaces any caller that bypasses the capability check.
  markThreadAsDone: () => {
    throw new Error(
      'Mark-as-done is not supported for Gitea accounts; check capabilities.markAsDone before calling.',
    );
  },
  unsubscribeThread: () => {
    throw new Error(
      'Ignoring thread subscriptions is not supported for Gitea accounts; check capabilities.unsubscribeThread before calling.',
    );
  },

  followUrl<T>(account: Account, url: Link): Promise<T> {
    return giteaGetJson<T>(account, url);
  },
  getDisplayHelpers,

  // Gitea PATs from /user/settings/applications are 40-char lowercase hex.
  validateToken: (token: Token) => /^[a-f0-9]{40}$/.test(token),
  getPersonalAccessTokenSettingsUrl: (hostname: Hostname) =>
    `https://${hostname}/user/settings/applications` as Link,
  getAccountSettingsUrl: (account: Account) =>
    `https://${account.hostname}/user/settings/applications` as Link,
  documentationUrl: GITEA_DOCS_URL,

  supportsOAuthScopes: false,

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
