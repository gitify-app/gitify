import { useAccountsStore, useSettingsStore } from '../../stores';

import type { AccountNotifications, AuthState, RawGitifyNotification } from '../../types';

import { determineFailureType } from '../api/errors';
import { rendererLogError, toError } from '../core/logger';
import { getAdapter } from '../forges/registry';
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

function getNotifications(auth: AuthState) {
  return auth.accounts.map((account) => {
    return {
      account,
      notifications: getAdapter(account).listNotifications(account),
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
  const auth: AuthState = { accounts: useAccountsStore.getState().accounts };

  const accountNotifications: AccountNotifications[] = await Promise.all(
    getNotifications(auth)
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
  return enrich(notifications);
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
