import type {
  AccountNotifications,
  GitifyNotification,
  GitifyState,
  GitifySubject,
  SettingsState,
} from '../../types';
import {
  fetchNotificationDetailsForList,
  listNotificationsForAuthenticatedUser,
} from '../api/client';
import { determineFailureType } from '../api/errors';
import type { FetchMergedDetailsTemplateQuery } from '../api/graphql/generated/graphql';
import { transformNotification } from '../api/transform';
import { rendererLogError, rendererLogWarn } from '../logger';
import {
  filterBaseNotifications,
  filterDetailedNotifications,
} from './filters/filter';
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

function getNotifications(state: GitifyState) {
  return state.auth.accounts.map((account) => {
    return {
      account,
      notifications: listNotificationsForAuthenticatedUser(
        account,
        state.settings,
      ),
    };
  });
}

/**
 * Get all notifications for all accounts.
 *
 * @param state - The Gitify state.
 * @returns A promise that resolves to an array of account notifications.
 */
export async function getAllNotifications(
  state: GitifyState,
): Promise<AccountNotifications[]> {
  const accountNotifications: AccountNotifications[] = await Promise.all(
    getNotifications(state)
      .filter((response) => !!response)
      .map(async (accountNotifications) => {
        try {
          const rawNotifications = (await accountNotifications.notifications)
            .data;

          let notifications = rawNotifications.map((raw) => {
            return transformNotification(raw, accountNotifications.account);
          });

          notifications = filterBaseNotifications(
            notifications,
            state.settings,
          );

          notifications = await enrichNotifications(
            notifications,
            state.settings,
          );

          notifications = filterDetailedNotifications(
            notifications,
            state.settings,
          );

          notifications = notifications.map((notification) => {
            const handler = createNotificationHandler(notification);
            return {
              ...notification,
              display: {
                title: handler.formattedNotificationTitle(notification),
                type: handler.formattedNotificationType(notification),
                number: handler.formattedNotificationNumber(notification),
                icon: {
                  type: handler.iconType(notification),
                  color: handler.iconColor(notification),
                },
                defaultUserType: handler.defaultUserType(),
              },
            };
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
  stabilizeNotificationsOrder(accountNotifications, state.settings);

  return accountNotifications;
}

export async function enrichNotifications(
  notifications: GitifyNotification[],
  settings: SettingsState,
): Promise<GitifyNotification[]> {
  if (!settings.detailedNotifications) {
    return notifications;
  }

  // Build and fetch merged details via client; returns per-notification results
  let mergedResults: Map<
    GitifyNotification,
    FetchMergedDetailsTemplateQuery['repository']
  > = new Map();
  try {
    mergedResults = await fetchNotificationDetailsForList(notifications);
  } catch (err) {
    rendererLogError(
      'enrichNotifications',
      'Failed to fetch merged notification details',
      err,
    );
  }

  const enrichedNotifications = await Promise.all(
    notifications.map(async (notification: GitifyNotification) => {
      const fragment = mergedResults.get(notification);

      return enrichNotification(notification, settings, fragment);
    }),
  );
  return enrichedNotifications;
}

/**
 * Enrich a notification with additional details.
 *
 * @param notification - The notification to enrich.
 * @param settings - The settings to use for enrichment.
 * @returns The enriched notification.
 */
export async function enrichNotification(
  notification: GitifyNotification,
  settings: SettingsState,
  fetchedData?: unknown,
): Promise<GitifyNotification> {
  let additionalSubjectDetails: Partial<GitifySubject> = {};

  try {
    const handler = createNotificationHandler(notification);
    additionalSubjectDetails = await handler.enrich(
      notification,
      settings,
      fetchedData,
    );
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
  settings: SettingsState,
) {
  let orderIndex = 0;

  for (const account of accountNotifications) {
    const flattenedNotifications = getFlattenedNotificationsByRepo(
      account.notifications,
      settings,
    );

    for (const notification of flattenedNotifications) {
      notification.order = orderIndex++;
    }
  }
}
