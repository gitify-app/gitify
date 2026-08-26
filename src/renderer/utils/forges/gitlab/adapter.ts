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
 * GitLab's only to-do state transition is "mark as done", so Gitify exposes it
 * as the done action and aliases mark-as-read onto the same call.
 */
const capabilities: ForgeCapabilities = {
  markAsDone: () => true,
  unsubscribeThread: () => false,
};

async function fetchAuthenticatedUser(account: Account): Promise<RefreshAccountData> {
  const user = await fetchGitLabAuthenticatedUser(account);

  return {
    user: {
      id: String(user.id),
      login: user.username,
      name: user.name ?? null,
      avatar: user.avatar_url ?? '',
    },
    version: await fetchVersionOrUndefined(account),
    scopes: await fetchScopesOrUndefined(account),
  };
}

/**
 * Instance version and token scopes are supplementary: a token without the
 * breadth to read them still works for notifications, so a failure here must
 * not fail the login.
 */
async function fetchVersionOrUndefined(account: Account): Promise<string | undefined> {
  try {
    const { version } = await fetchGitLabVersion(account);
    return version;
  } catch {
    return undefined;
  }
}

async function fetchScopesOrUndefined(account: Account): Promise<string[] | undefined> {
  try {
    const { scopes } = await fetchGitLabTokenMetadata(account);
    return scopes;
  } catch {
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

  // GitLab exposes a single state transition for a to-do item, so both verbs
  // resolve to the same call rather than one of them throwing.
  markThreadAsRead: (account, threadId) => markGitLabTodoAsDone(account, threadId),
  markThreadAsDone: (account, threadId) => markGitLabTodoAsDone(account, threadId),
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
