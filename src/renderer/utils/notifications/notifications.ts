import { Constants } from '../../constants';

import { useAccountsStore, useSettingsStore } from '../../stores';

import type {
  AccountNotifications,
  GitifyNotification,
  GitifySubject,
} from '../../types';

import {
  fetchNotificationDetailsForList,
  listNotificationsForAuthenticatedUser,
} from '../api/client';
import { determineFailureType } from '../api/errors';
import type { FetchMergedDetailsTemplateQuery } from '../api/graphql/generated/graphql';
import { transformNotifications } from '../api/transform';
import { rendererLogError, rendererLogWarn } from '../logger';
import {
  filterBaseNotifications,
  filterDetailedNotifications,
} from './filters/filter';
import { formatNotification } from './formatters';
import { getFlattenedNotificationsByRepo } from './group';
import { createNotificationHandler } from './handlers';

/**
 * Get the count of notifications across all accounts.
 *
 * @param accountNotifications - The account notifications to check.
 * @returns The count of all notifications.
 */
export function getNotificationCount(
  accountNotifications: AccountNotifications[],
) {
  return accountNotifications.reduce(
    (sum, account) => sum + account.notifications.length,
    0,
  );
}

/**
 * Get the count of notifications across all accounts.
 *
 * @param accountNotifications - The account notifications to check.
 * @returns The count of unread notifications.
 */
export function getUnreadNotificationCount(
  accountNotifications: AccountNotifications[],
) {
  return accountNotifications.reduce(
    (sum, account) =>
      sum + account.notifications.filter((n) => n.unread === true).length,
    0,
  );
}

function getNotifications() {
  const accounts = useAccountsStore.getState().accounts;
  return accounts.map((account) => {
    return {
      account,
      notifications: listNotificationsForAuthenticatedUser(account),
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
 * @param state - The Gitify state.
 * @returns A promise that resolves to an array of account notifications.
 */
export async function getAllNotifications(): Promise<AccountNotifications[]> {
  const accountNotifications: AccountNotifications[] = await Promise.all(
    getNotifications()
      .filter((response) => !!response)
      .map(async (accountNotifications) => {
        try {
          const rawNotifications = await accountNotifications.notifications;

          let notifications = transformNotifications(
            rawNotifications,
            accountNotifications.account,
          );

          // TODO remove to query select filtering
          notifications = filterBaseNotifications(notifications);

          notifications = await enrichNotifications(notifications);

          notifications = filterDetailedNotifications(notifications);

          notifications = notifications.map((notification) => {
            return formatNotification(notification);
          });

          return {
            account: accountNotifications.account,
            notifications: notifications,
            error: null,
          };
        } catch (err) {
          rendererLogError(
            'getAllNotifications',
            'error occurred while fetching account notifications',
            err,
          );

          return {
            account: accountNotifications.account,
            notifications: [],
            error: determineFailureType(err),
          };
        }
      }),
  );

  // Set the order property for the notifications
  stabilizeNotificationsOrder(accountNotifications);

  return accountNotifications;
}

/**
 * Enrich notification details
 *
 * @param notifications All Gitify inbox notifications
 * @returns
 */
export async function enrichNotifications(
  notifications: GitifyNotification[],
): Promise<GitifyNotification[]> {
  const settings = useSettingsStore.getState();

  if (!settings.detailedNotifications) {
    return notifications;
  }

  const mergedResults = await fetchNotificationDetailsInBatches(notifications);

  const enrichedNotifications = await Promise.all(
    notifications.map(async (notification: GitifyNotification) => {
      const fragment = mergedResults.get(notification);

      return enrichNotification(notification, fragment);
    }),
  );
  return enrichedNotifications;
}

/**
 * Fetch notification details in batches to avoid overwhelming the API.
 *
 * @param notifications - The notifications to fetch details for.
 * @returns A map of notifications to their repository details.
 */
async function fetchNotificationDetailsInBatches(
  notifications: GitifyNotification[],
): Promise<
  Map<GitifyNotification, FetchMergedDetailsTemplateQuery['repository']>
> {
  const mergedResults: Map<
    GitifyNotification,
    FetchMergedDetailsTemplateQuery['repository']
  > = new Map();

  const batchSize = Constants.GITHUB_API_MERGE_BATCH_SIZE;

  for (
    let batchStart = 0;
    batchStart < notifications.length;
    batchStart += batchSize
  ) {
    const batchIndex = Math.floor(batchStart / batchSize) + 1;
    const batchNotifications = notifications.slice(
      batchStart,
      batchStart + batchSize,
    );

    try {
      const batchResults =
        await fetchNotificationDetailsForList(batchNotifications);

      for (const [notification, repository] of batchResults) {
        mergedResults.set(notification, repository);
      }
    } catch (err) {
      rendererLogError(
        'fetchNotificationDetailsInBatches',
        `Failed to fetch merged notification details for batch ${batchIndex}`,
        err,
      );
    }
  }

  return mergedResults;
}

/**
 * Enrich a notification with additional details.
 *
 * @param notification - The notification to enrich.
 * @returns The enriched notification.
 */
export async function enrichNotification(
  notification: GitifyNotification,
  fetchedData?: unknown,
): Promise<GitifyNotification> {
  let additionalSubjectDetails: Partial<GitifySubject> = {};

  try {
    const handler = createNotificationHandler(notification);
    additionalSubjectDetails = await handler.enrich(notification, fetchedData);
  } catch (err) {
    rendererLogError(
      'enrichNotification',
      'failed to enrich notification details for',
      err,
      notification,
    );

    rendererLogWarn(
      'enrichNotification',
      'Continuing with base notification details',
    );
  }

  return {
    ...notification,
    subject: {
      ...notification.subject,
      ...additionalSubjectDetails,
    },
  };
}

/**
 * Assign an order property to each notification to stabilize how they are displayed
 * during notification interaction events (mark as read, mark as done, etc.)
 *
 * @param accountNotifications
 * @param settings
 */
export function stabilizeNotificationsOrder(
  accountNotifications: AccountNotifications[],
) {
  let orderIndex = 0;

  for (const account of accountNotifications) {
    const flattenedNotifications = getFlattenedNotificationsByRepo(
      account.notifications,
    );

    for (const notification of flattenedNotifications) {
      notification.order = orderIndex++;
    }
  }
}
