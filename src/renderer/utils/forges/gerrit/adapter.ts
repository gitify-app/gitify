import { KeyIcon } from '@primer/octicons-react';

import semver from 'semver';

import type { Account, Hostname, Link, RawGitifyNotification, Token } from '../../../types';
import type {
  ForgeAdapter,
  ForgeCapabilities,
  NotificationDisplayHelpers,
  RefreshAccountData,
} from '../types';

import { GerritIcon } from '../../../icons/GerritIcon';
import { isValidHostname } from '../../auth/identity';
import { rendererLogWarn } from '../../core/logger';
import { createNotificationHandler } from '../github/handlers';
import {
  fetchGerritAuthenticatedUser,
  gerritGetJson,
  listGerritChanges,
  removeSelfFromAttentionSet,
} from './client';
import { transformGerritChanges } from './transform';

const GERRIT_DOCS_URL =
  'https://gerrit-review.googlesource.com/Documentation/rest-api.html' as Link;

// Support-policy recommendation, not a technical requirement for Attention Set.
const GERRIT_RECOMMENDED_VERSION = '3.12.0';

const capabilities: ForgeCapabilities = {
  // Gerrit has no "done"/archive concept distinct from "mark as read"
  // (removing the calling user from a change's attention set already covers
  // that). Throwing rather than silently aliasing to markThreadAsRead
  // surfaces any caller that bypasses the capability check.
  markAsDone: () => false,
  // Gerrit has no per-change unsubscribe; only project-level watch filters,
  // which are a different (broader) scope than a single thread.
  unsubscribeThread: () => false,
};

function warnOnOlderVersion(rawVersion: string | undefined): void {
  if (!rawVersion) {
    return;
  }

  const coerced = semver.coerce(rawVersion);
  if (coerced && semver.lt(coerced, GERRIT_RECOMMENDED_VERSION)) {
    rendererLogWarn(
      'gerrit:fetchAuthenticatedUser',
      `Gerrit server version ${rawVersion} is older than the recommended ${GERRIT_RECOMMENDED_VERSION}. Login is allowed, but compatibility is not guaranteed.`,
    );
  }
}

async function fetchAuthenticatedUser(account: Account): Promise<RefreshAccountData> {
  const { account: gerritUser, version } = await fetchGerritAuthenticatedUser(account);

  warnOnOlderVersion(version);

  return {
    user: {
      id: String(gerritUser._account_id),
      login: gerritUser.username ?? gerritUser.name ?? String(gerritUser._account_id),
      name: gerritUser.name ?? gerritUser.display_name ?? null,
      avatar: gerritUser.avatars?.[0]?.url ?? '',
    },
    version: version ? (semver.coerce(version)?.version ?? version) : undefined,
  };
}

async function listNotifications(account: Account): Promise<RawGitifyNotification[]> {
  const raw = await listGerritChanges(account);
  return transformGerritChanges(raw, account);
}

// Gerrit changes are mapped onto the shared 'PullRequest' subject type (see
// transform.ts), so this reuses GitHub's notification-type handler dispatch
// for display helpers — same precedent as `gitea/adapter.ts`. The dispatch
// only reads `subject.state`/`subject.htmlUrl` here; it never triggers
// GitHub-specific network calls.
function getDisplayHelpers(notification: RawGitifyNotification): NotificationDisplayHelpers {
  const handler = createNotificationHandler(notification);
  return {
    iconType: handler.iconType(notification),
    iconColor: handler.iconColor(notification),
    defaultUrl: handler.defaultUrl(notification),
    defaultUserType: handler.defaultUserType(),
  };
}

/**
 * Build a Gerrit `/q/` search-results URL for the given query predicates.
 * Predicates are joined with a literal `+`, matching Gerrit's own
 * self-referential dashboard links (e.g. `#/q/status:open+is:watched`).
 */
function buildGerritQueryUrl(account: Account, ...predicates: string[]): Link {
  const url = new URL(`https://${account.hostname}/q/${predicates.join('+')}`);
  return url.toString() as Link;
}

export const gerritAdapter: ForgeAdapter = {
  id: 'gerrit',
  displayName: 'Gerrit',
  tagline: 'Gerrit Code Review',
  icon: GerritIcon,
  getPlatform: () => 'Gerrit',
  validateHostname: isValidHostname,

  // Gerrit's own UI does not prefix usernames with "@".
  formatUserLogin: (login) => login,

  accountOps: {
    capabilities,
    formatNotificationUser: (_account, user) => user.login,
    fetchAuthenticatedUser,
    listNotifications,

    markThreadAsRead: (account, threadId) =>
      removeSelfFromAttentionSet(account, threadId, 'Marked as read via Gitify'),
    markThreadAsDone: () => {
      throw new Error(
        'Mark-as-done is not supported for Gerrit accounts; check capabilities.markAsDone before calling.',
      );
    },
    unsubscribeThread: () => {
      throw new Error(
        'Unsubscribing from a single change is not supported for Gerrit accounts; check capabilities.unsubscribeThread before calling.',
      );
    },

    followUrl<T>(account: Account, url: Link): Promise<T> {
      return gerritGetJson<T>(account, url);
    },

    // "My changes" (Gerrit has no "pull request" terminology, but this is the
    // closest — and only — equivalent cross-project dashboard). Explicit
    // username rather than the `self` keyword so the link resolves correctly
    // even if the browser isn't already authenticated as this exact account.
    getPullRequestsUrl: (account) =>
      buildGerritQueryUrl(
        account,
        'status:open',
        `owner:${encodeURIComponent(account.user?.login ?? 'self')}`,
      ),
    // Mirrors this adapter's own notification model (see transform.ts):
    // presence in the attention set is what Gitify surfaces as "unread".
    getNotificationsUrl: (account) =>
      buildGerritQueryUrl(
        account,
        `attention:${encodeURIComponent(account.user?.login ?? 'self')}`,
      ),
    getIssuesUrl: () => undefined,
    // Gerrit has no personal profile page; the closest equivalent is the list
    // of changes this account owns (same convention already used for
    // individual notification authors — see `transform.ts`'s `mapAccount`).
    getAccountProfileUrl: (account) =>
      buildGerritQueryUrl(account, `owner:${encodeURIComponent(account.user?.login ?? 'self')}`),
    getAccountSettingsUrl: (account: Account) =>
      `https://${account.hostname}/settings/#HTTPCredentials` as Link,
  },
  getDisplayHelpers,

  // Gerrit HTTP passwords / authentication tokens have no fixed, documented
  // format (unlike GitHub's 40-char hex or Gitea's 40-char lowercase hex) —
  // same permissive approach as Bitbucket's Atlassian API tokens.
  validateToken: (token: Token) => token.length > 0,
  getPersonalAccessTokenSettingsUrl: (hostname: Hostname) =>
    `https://${hostname}/settings/#HTTPCredentials` as Link,
  documentationUrl: GERRIT_DOCS_URL,
  // Gerrit only supports HTTP password / authentication token login today, so
  // every method falls through to the key icon.
  getAuthMethodIcon: () => KeyIcon,

  loginMethods: [
    {
      testId: 'login-gerrit-pat',
      icon: KeyIcon,
      label: 'HTTP Password / Token',
      route: '/login/gerrit/personal-access-token',
      authMethod: 'Personal Access Token',
    },
  ],

  // Gerrit has no GitHub-style OAuth scope concept, so `oauthScopes` is
  // omitted. Callers skip scopes UI when this is undefined.
};
