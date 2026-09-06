import type { Account, Forge, Link } from '../../types';
import type { ForgeAccountAdapter, ForgeAdapter } from './types';

import { bitbucketAdapter } from './bitbucket/adapter';
import { giteaAdapter } from './gitea/adapter';
import { githubAdapter } from './github/adapter';
import { gitlabAdapter } from './gitlab/adapter';

/**
 * Central forge adapter registry.
 *
 * Adding a new forge is one entry in this map. Shared code routes through
 * `getAdapter(forge)` for forge-wide members and `getAccountAdapter(account)` for
 * account-scoped operations, and never imports forge-specific modules
 * directly.
 */
const ADAPTERS: Record<Forge, ForgeAdapter> = {
  github: githubAdapter,
  gitea: giteaAdapter,
  bitbucket: bitbucketAdapter,
  gitlab: gitlabAdapter,
};

/** Single source of truth for the runtime set of registered forges. */
export const KNOWN_FORGES: ReadonlySet<Forge> = new Set(Object.keys(ADAPTERS) as Forge[]);

/** Type guard for unknown JSON values (e.g. persisted account state). */
export function isKnownForge(forge: unknown): forge is Forge {
  return typeof forge === 'string' && KNOWN_FORGES.has(forge as Forge);
}

/**
 * Resolve the adapter for an account or a forge id.
 *
 * Throws if the forge is not registered — should be impossible once
 * `Account.forge` is required and migration has run, but we surface a loud
 * error rather than crashing on a property access.
 */
export function getAdapter(forgeOrAccount: Forge | Account): ForgeAdapter {
  const id = typeof forgeOrAccount === 'string' ? forgeOrAccount : forgeOrAccount.forge;
  const adapter = ADAPTERS[id];
  if (!adapter) {
    throw new Error(`No forge adapter registered for "${id}"`);
  }
  return adapter;
}

/** Create a view for this account snapshot; resolve a new view when the account changes. */
export function getAccountAdapter(account: Account): ForgeAccountAdapter {
  const {
    capabilities,
    formatNotificationUser,
    fetchAuthenticatedUser,
    onAccountTokenChange,
    listNotifications,
    markThreadAsRead,
    markThreadAsDone,
    unsubscribeThread,
    followUrl,
    getAccountSettingsUrl,
    getIssuesUrl,
    getPullRequestsUrl,
    getNotificationsUrl,
    oauthScopes,
  } = getAdapter(account).accountOps;

  return {
    capabilities: {
      markAsDone: () => capabilities.markAsDone(account),
      unsubscribeThread: () => capabilities.unsubscribeThread(account),
    },
    formatNotificationUser: (user) => formatNotificationUser(account, user),
    fetchAuthenticatedUser: () => fetchAuthenticatedUser(account),
    onAccountTokenChange: onAccountTokenChange ? () => onAccountTokenChange(account) : undefined,
    listNotifications: () => listNotifications(account),
    markThreadAsRead: (threadId) => markThreadAsRead(account, threadId),
    markThreadAsDone: (threadId) => markThreadAsDone(account, threadId),
    unsubscribeThread: (threadId) => unsubscribeThread(account, threadId),
    followUrl: <T>(url: Link) => followUrl<T>(account, url),
    getAccountSettingsUrl: () => getAccountSettingsUrl(account),
    getIssuesUrl: () => getIssuesUrl(account),
    getPullRequestsUrl: () => getPullRequestsUrl(account),
    getNotificationsUrl: () => getNotificationsUrl(account),
    oauthScopes: oauthScopes
      ? {
          hasRequired: () => oauthScopes.hasRequired(account),
          hasRecommended: () => oauthScopes.hasRecommended(account),
          hasAlternate: () => oauthScopes.hasAlternate(account),
        }
      : undefined,
  };
}

export function listAdapters(): ForgeAdapter[] {
  return Object.values(ADAPTERS);
}
