import { KeyIcon } from '@primer/octicons-react';

import { GitLabIcon } from '../../../components/icons/GitLabIcon';

import type { Account, Hostname, Link, RawGitifyNotification, Token } from '../../../types';
import { IconColor } from '../../../types';
import type { PlatformType } from '../../auth/types';
import type {
  ForgeAdapter,
  ForgeCapabilities,
  NotificationDisplayHelpers,
  RefreshAccountData,
} from '../types';

import { rendererLogWarn, toError } from '../../core/logger';
import { createNotificationHandler } from '../github/handlers';
import {
  fetchGitLabAuthenticatedUser,
  fetchGitLabTokenMetadata,
  fetchGitLabVersion,
  gitlabGetJson,
  listGitLabTodos,
  markGitLabTodoAsDone,
} from './client';
import { transformGitLabTodos } from './transform';

const GITLAB_DOCS_URL = 'https://docs.gitlab.com/api/todos/' as Link;

const GITLAB_CLOUD_HOSTNAME = 'gitlab.com' as Hostname;

/**
 * GitLab offers exactly one to-do transition (`mark_as_done`), so there is no
 * distinct done state to expose alongside mark-as-read. Reporting `false` keeps
 * the row to a single button; the orchestrator routes mark-as-done through the
 * mark-as-read fallback, which lands on the same endpoint.
 */
const capabilities: ForgeCapabilities = {
  markAsDone: () => false,
  unsubscribeThread: () => false,
};

async function fetchAuthenticatedUser(account: Account): Promise<RefreshAccountData> {
  const [user, version, scopes] = await Promise.all([
    fetchGitLabAuthenticatedUser(account),
    fetchVersionOrUndefined(account),
    fetchScopesOrUndefined(account),
  ]);

  return {
    user: {
      id: String(user.id),
      login: user.username,
      name: user.name ?? null,
      avatar: user.avatar_url ?? '',
    },
    version,
    scopes,
  };
}

/**
 * Instance version and token scopes are supplementary: a token without the
 * breadth to read them still works for notifications, so a failure here is
 * logged and dropped rather than failing the login.
 */
async function fetchVersionOrUndefined(account: Account): Promise<string | undefined> {
  try {
    const { version } = await fetchGitLabVersion(account);
    return version;
  } catch (err) {
    rendererLogWarn(
      'gitlab',
      `Could not read instance version for ${account.hostname}: ${toError(err).message}`,
    );
    return undefined;
  }
}

async function fetchScopesOrUndefined(account: Account): Promise<string[] | undefined> {
  try {
    const { scopes } = await fetchGitLabTokenMetadata(account);
    return scopes;
  } catch (err) {
    rendererLogWarn(
      'gitlab',
      `Could not read token scopes for ${account.hostname}: ${toError(err).message}`,
    );
    return undefined;
  }
}

async function listNotifications(account: Account): Promise<RawGitifyNotification[]> {
  const raw = await listGitLabTodos(account);
  return transformGitLabTodos(raw, account);
}

/**
 * GitLab reuses GitHub's notification-type handler dispatch for display
 * helpers. Targets that map onto Issue / PullRequest / Commit get the matching
 * icon and colour; everything else falls through to the default handler, so
 * the deep link from the to-do item is used directly.
 */
function getDisplayHelpers(notification: RawGitifyNotification): NotificationDisplayHelpers {
  if (notification.subject.type === 'GitLabTodo') {
    return {
      iconType: GitLabIcon,
      iconColor: IconColor.GRAY,
      defaultUrl: notification.subject.htmlUrl ?? notification.repository.htmlUrl,
      defaultUserType: 'User',
    };
  }

  const handler = createNotificationHandler(notification);
  return {
    iconType: handler.iconType(notification),
    iconColor: handler.iconColor(notification),
    defaultUrl: notification.subject.htmlUrl ?? handler.defaultUrl(notification),
    defaultUserType: handler.defaultUserType(),
  };
}

function getPlatform(hostname: Hostname): PlatformType {
  return hostname === GITLAB_CLOUD_HOSTNAME ? 'GitLab Cloud' : 'GitLab Self-Managed';
}

export const gitlabAdapter: ForgeAdapter = {
  id: 'gitlab',
  displayName: 'GitLab',
  tagline: 'GitLab.com & Self-Managed',
  icon: GitLabIcon,
  capabilities,

  getPlatform,
  formatUserLogin: (login) => login,
  formatNotificationUser: (_account, user) => user.login,

  fetchAuthenticatedUser,
  listNotifications,

  markThreadAsRead: (account, threadId) => markGitLabTodoAsDone(account, threadId),
  // Capability `markAsDone(account)` returns false, so the orchestrator falls
  // back to mark-as-read before reaching here. Throwing surfaces any caller
  // that bypasses the capability check.
  markThreadAsDone: () => {
    throw new Error(
      'Mark-as-done is not supported for GitLab accounts; check capabilities.markAsDone before calling.',
    );
  },
  unsubscribeThread: () => {
    throw new Error(
      'Ignoring thread subscriptions is not supported for GitLab accounts; check capabilities.unsubscribeThread before calling.',
    );
  },

  followUrl<T>(account: Account, url: Link): Promise<T> {
    return gitlabGetJson<T>(account, url);
  },
  getDisplayHelpers,

  defaultHostname: GITLAB_CLOUD_HOSTNAME,

  // GitLab tokens are `glpat-` prefixed by default, but self-managed admins can
  // reconfigure the prefix and the modern format embeds a routing suffix, so
  // any non-empty value is accepted rather than pinning a length or shape.
  validateToken: (token: Token) => token.trim().length > 0,

  getPersonalAccessTokenSettingsUrl: (hostname: Hostname) =>
    `https://${hostname}/-/user_settings/personal_access_tokens` as Link,
  getAccountSettingsUrl: (account: Account) =>
    `https://${account.hostname}/-/user_settings/personal_access_tokens` as Link,
  getIssuesUrl: (account) => {
    const url = new URL(`https://${account.hostname}/dashboard/issues`);
    if (account.user) {
      url.searchParams.set('assignee_username', account.user.login);
    }
    return url.toString() as Link;
  },
  getPullRequestsUrl: (account) => `https://${account.hostname}/dashboard/merge_requests` as Link,
  // GitLab's "notification feed" for the current user is the To-Do List
  // (bell icon). Gitify reads to-dos for GitLab, so link there.
  getNotificationsUrl: (account) => `https://${account.hostname}/dashboard/todos` as Link,

  documentationUrl: GITLAB_DOCS_URL,

  // GitLab only supports PAT in Gitify today, so every method falls through to
  // the key icon.
  getAuthMethodIcon: () => KeyIcon,

  loginMethods: [
    {
      testId: 'login-gitlab-pat',
      icon: KeyIcon,
      label: 'Personal Access Token',
      route: '/login/gitlab/personal-access-token',
      authMethod: 'Personal Access Token',
    },
  ],
};
