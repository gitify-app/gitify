import { useAccountsStore, useSettingsStore } from '../../stores';

import type {
  Account,
  AccountNotifications,
  GitifySubject,
  RawGitifyNotification,
} from '../../types';

import { determineFailureType } from '../api/errors';
import { getAccountUUID } from '../auth/utils';
import { rendererLogError, toError } from '../core/logger';
import { forAccount, getAdapter } from '../forges/registry';
import { filterBaseNotifications } from './filters/filter';
import { formatNotification } from './formatters';
import { getFlattenedNotificationsByRepo } from './group';

/**
 * Get the count of notifications across all accounts.
 *
 * @param accountNotifications - The account notifications to check.
 * @returns The count of all notifications.
 */
export function getNotificationCount(accountNotifications: AccountNotifications[]) {
  return accountNotifications.reduce((sum, account) => sum + account.notifications.length, 0);
}

/**
 * Get the count of notifications across all accounts.
 *
 * @param accountNotifications - The account notifications to check.
 * @returns The count of unread notifications.
 */
export function getUnreadNotificationCount(accountNotifications: AccountNotifications[]) {
  return accountNotifications.reduce(
    (sum, account) => sum + account.notifications.filter((n) => n.unread === true).length,
    0,
  );
}

function getNotifications(accounts: Account[]) {
  return accounts.map((account) => {
    return {
      account,
      notifications: forAccount(account).listNotifications(),
    };
  });
}

/**
 * Get all notifications for all accounts.
 *
 * Notifications follow these stages:
 *  - Fetch / retrieval
 *  - Transform
 *  - Base filtering
 *  - Enrichment
 *  - Detailed filtering
 *  - Formatting
 *  - Ordering
 *
 * @returns A promise that resolves to an array of account notifications.
 */
export async function getAllNotifications(): Promise<AccountNotifications[]> {
  const accountNotifications: AccountNotifications[] = await Promise.all(
    getNotifications(useAccountsStore.getState().accounts)
      .filter((response) => !!response)
      .map(async (accountNotifications) => {
        try {
          const notifications: RawGitifyNotification[] = await accountNotifications.notifications;

          // All notifications are cached unfiltered; filtering happens in the
          // notifications query `select` so filter changes apply instantly
          // without refetching. Enrichment is limited to notifications that
          // pass the current base filters to bound API usage - notifications
          // hidden by an active filter are enriched on a later poll once they
          // become visible.
          const baseFiltered = filterBaseNotifications(notifications);

          const enriched = await enrichNotifications(baseFiltered);
          const enrichedById = new Map(
            enriched.map((notification) => [notification.id, notification]),
          );

          const formatted = notifications.map((notification) =>
            formatNotification(enrichedById.get(notification.id) ?? notification),
          );

          return {
            account: accountNotifications.account,
            notifications: formatted,
            error: null,
          };
        } catch (err) {
          rendererLogError(
            'getAllNotifications',
            'error occurred while fetching account notifications',
            toError(err),
          );

          return {
            account: accountNotifications.account,
            notifications: [],
            error: determineFailureType(toError(err)),
          };
        }
      }),
  );

  // Set the order property for the notifications
  stabilizeNotificationsOrder(accountNotifications);

  return accountNotifications;
}

/**
 * Enrich notifications with detailed subject data (state, user, number, etc.).
 *
 * Only runs when `settings.detailedNotifications` is enabled; returns the
 * original list unchanged otherwise. Details are fetched in batches via
 * GraphQL to avoid overwhelming the API.
 *
 * To avoid re-fetching details for notifications that have not changed,
 * previously-enriched subjects are cached keyed by account, notification id,
 * and `updatedAt` (see {@link enrichmentCacheKey}). GitHub bumps a
 * notification's `updatedAt` whenever its subject changes in a way worth
 * surfacing, so an unchanged `updatedAt` means the cached subject is still
 * valid and the detail fetch can be skipped entirely. This sharply reduces
 * per-poll API request volume for users with many long-lived notifications.
 *
 * @param notifications - The notifications to enrich.
 * @returns The same notifications with subject fields populated from the API.
 */
export async function enrichNotifications(
  notifications: RawGitifyNotification[],
): Promise<RawGitifyNotification[]> {
  if (!useSettingsStore.getState().detailedNotifications || !notifications.length) {
    return notifications;
  }

  // Adapters that do not implement enrichment (e.g. Gitea) leave
  // notifications unchanged.
  const enrich = getAdapter(notifications[0].account).enrichNotifications;
  if (!enrich) {
    return notifications;
  }

  // Reuse cached subjects for notifications whose `updatedAt` is unchanged and
  // only fetch details for cache misses, so unchanged notifications are not
  // re-fetched on every poll cycle. The cached subject is applied onto the
  // freshly-fetched notification so read-state and ordering stay current.
  const liveKeys = new Set<string>();
  const result: RawGitifyNotification[] = [];
  const misses: RawGitifyNotification[] = [];
  const missIndexes: number[] = [];

  notifications.forEach((notification, index) => {
    const key = enrichmentCacheKey(notification);
    liveKeys.add(key);

    const cachedSubject = enrichmentCache.get(key);
    if (cachedSubject) {
      result[index] = { ...notification, subject: cachedSubject };
    } else {
      misses.push(notification);
      missIndexes.push(index);
    }
  });

  if (misses.length) {
    // Adapters return enriched notifications in the same order as their input,
    // so map results back positionally rather than by id.
    const enriched = await enrich(misses);
    enriched.forEach((enrichedNotification, i) => {
      const index = missIndexes[i];
      result[index] = enrichedNotification;

      // Adapters signal a failed enrichment by returning the notification
      // with its original `subject` reference unchanged. Skip caching those
      // so they are retried on the next poll instead of serving base details
      // until `updatedAt` next changes.
      if (enrichedNotification.subject !== misses[i].subject) {
        enrichmentCache.set(enrichmentCacheKey(enrichedNotification), enrichedNotification.subject);
      }
    });
  }

  // Bound cache growth: drop this account's entries for notifications no
  // longer present. Enrichment runs once per account (and concurrently across
  // accounts), so the prune must not touch other accounts' entries, which are
  // never in `liveKeys`.
  const accountKeyPrefix = `${getAccountUUID(notifications[0].account)}:`;
  for (const key of enrichmentCache.keys()) {
    if (key.startsWith(accountKeyPrefix) && !liveKeys.has(key)) {
      enrichmentCache.delete(key);
    }
  }

  return result;
}

/**
 * In-memory cache of enriched subjects keyed by {@link enrichmentCacheKey}.
 * Persists across poll cycles so unchanged notifications can skip enrichment,
 * and is pruned per account each cycle to that account's currently-present
 * notifications so it stays bounded to the live notification working set.
 */
const enrichmentCache = new Map<string, GitifySubject>();

/**
 * Build the enrichment cache key for a notification from its account, id, and
 * last-updated timestamp. A change to any of these invalidates the cached
 * subject and forces a re-fetch.
 */
function enrichmentCacheKey(notification: RawGitifyNotification): string {
  return `${getAccountUUID(notification.account)}:${notification.id}:${notification.updatedAt}`;
}

/**
 * Timestamp of the last {@link refreshEnrichmentCache} that actually cleared
 * the cache, used to throttle focus-triggered refreshes.
 */
let lastEnrichmentCacheRefreshAt = 0;

/**
 * Drop all cached subjects so the next enrichment pass re-fetches every
 * notification. Called when the window regains focus: some subject changes
 * (labels, milestones, reactions) never bump a notification's `updatedAt`,
 * so cached details can drift while the app polls in the background. Clearing
 * at the moment the user looks at the inbox bounds that drift to the moment
 * of viewing.
 *
 * Throttled so rapid window open/close cycles cost at most one extra
 * enrichment pass per `throttleMs`.
 *
 * @param throttleMs - Minimum time between cache-clearing refreshes.
 * @returns Whether the cache was cleared (`false` when throttled), so callers
 *          can trigger an immediate re-enrichment pass only when needed.
 */
export function refreshEnrichmentCache(throttleMs: number): boolean {
  const now = Date.now();
  if (now - lastEnrichmentCacheRefreshAt < throttleMs) {
    return false;
  }

  lastEnrichmentCacheRefreshAt = now;
  enrichmentCache.clear();

  return true;
}

/**
 * Clear the enrichment cache and its refresh throttle. Intended for use in
 * tests to keep the module-level state from leaking across cases.
 */
export function clearEnrichmentCache(): void {
  enrichmentCache.clear();
  lastEnrichmentCacheRefreshAt = 0;
}

/**
 * Assign an order property to each notification to stabilize how they are displayed
 * during notification interaction events (mark as read, mark as done, etc.)
 *
 * @param accountNotifications
 */
export function stabilizeNotificationsOrder(accountNotifications: AccountNotifications[]) {
  let orderIndex = 0;

  for (const account of accountNotifications) {
    const flattenedNotifications = getFlattenedNotificationsByRepo(account.notifications);

    for (const notification of flattenedNotifications) {
      notification.order = orderIndex++;
    }
  }
}
