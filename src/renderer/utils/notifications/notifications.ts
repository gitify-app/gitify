import { useAccountsStore, useSettingsStore } from '../../stores';

import type {
  AccountNotifications,
  AuthState,
  RawGitifyNotification,
  SettingsState,
} from '../../types';

import { determineFailureType } from '../api/errors';
import { rendererLogError, toError } from '../core/logger';
import { getAdapter } from '../forges/registry';
import { filterBaseNotifications, filterDetailedNotifications } from './filters/filter';
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

function getNotifications(auth: AuthState, settings: SettingsState) {
  return auth.accounts.map((account) => {
    return {
      account,
      notifications: getAdapter(account).listNotifications(account, settings),
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
  const settings = useSettingsStore.getState();

  const accountNotifications: AccountNotifications[] = await Promise.all(
    getNotifications(auth, settings)
      .filter((response) => !!response)
      .map(async (accountNotifications) => {
        try {
          let notifications: RawGitifyNotification[] = await accountNotifications.notifications;

          notifications = filterBaseNotifications(notifications);

          notifications = await enrichNotifications(notifications, settings);

          notifications = filterDetailedNotifications(notifications);

          const formatted = notifications.map((notification) => formatNotification(notification));

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
 * @param settings - Application settings; controls whether enrichment runs.
 * @returns The same notifications with subject fields populated from the API.
 */
export async function enrichNotifications(
  notifications: RawGitifyNotification[],
  settings: SettingsState,
): Promise<RawGitifyNotification[]> {
  if (!settings.detailedNotifications || !notifications.length) {
    return notifications;
  }

  // Adapters that do not implement enrichment (e.g. Gitea) leave
  // notifications unchanged.
  const enrich = getAdapter(notifications[0].account).enrichNotifications;
  if (!enrich) {
    return notifications;
  }
  return enrich(notifications, settings);
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
