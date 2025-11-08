import type {
  AccountNotifications,
  GitifyState,
  SettingsState,
} from '../../types';
import type { GitifySubject, Notification } from '../../typesGitHub';
import { listNotificationsForAuthenticatedUser } from '../api/client';
import { determineFailureType } from '../api/errors';
import { getAccountUUID } from '../auth/utils';
import { updateTrayColor, updateTrayTitle } from '../comms';
import { rendererLogError, rendererLogWarn } from '../logger';
import {
  filterBaseNotifications,
  filterDetailedNotifications,
} from './filters/filter';
import { getFlattenedNotificationsByRepo } from './group';
import { createNotificationHandler } from './handlers';

/**
 * Sets the tray icon color and title based on the number of unread notifications.
 *
 * @param notifications
 * @param settings
 */
export function setTrayIconColorAndTitle(
  notifications: AccountNotifications[],
  settings: SettingsState,
) {
  const totalUnreadNotifications = getUnreadNotificationCount(notifications);

  let title = '';
  if (settings.showNotificationsCountInTray && totalUnreadNotifications > 0) {
    title = totalUnreadNotifications.toString();
  }

  updateTrayColor(totalUnreadNotifications);
  updateTrayTitle(title);
}

/**
 * Get the count of unread notifications.
 *
 * @param notifications - The notifications to check.
 * @returns The count of unread notifications.
 */
export function getUnreadNotificationCount(
  notifications: AccountNotifications[],
) {
  return notifications.reduce(
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
  const notifications: AccountNotifications[] = await Promise.all(
    getNotifications(state)
      .filter((response) => !!response)
      .map(async (accountNotifications) => {
        try {
          let notifications = (
            await accountNotifications.notifications
          ).data.map((notification: Notification) => ({
            ...notification,
            account: accountNotifications.account,
          }));

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
  stabilizeNotificationsOrder(notifications, state.settings);

  return notifications;
}

export async function enrichNotifications(
  notifications: Notification[],
  settings: SettingsState,
): Promise<Notification[]> {
  if (!settings.detailedNotifications) {
    return notifications;
  }

  const enrichedNotifications = await Promise.all(
    notifications.map(async (notification: Notification) => {
      return enrichNotification(notification, settings);
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
  notification: Notification,
  settings: SettingsState,
) {
  let additionalSubjectDetails: GitifySubject = {};

  try {
    const handler = createNotificationHandler(notification);
    additionalSubjectDetails = await handler.enrich(notification, settings);
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
 * @param notifications
 * @param settings
 */
export function stabilizeNotificationsOrder(
  notifications: AccountNotifications[],
  settings: SettingsState,
) {
  const flattenedNotifications = getFlattenedNotificationsByRepo(
    notifications,
    settings,
  );

  let orderIndex = 0;

  for (const n of flattenedNotifications) {
    n.order = orderIndex++;
  }
}

/**
 * Find the account index for a given notification
 *
 * @param allNotifications - The list of all account notifications
 * @param notification - The notification to find the account index for
 * @returns The index of the account in the allNotifications array
 */
export const findAccountIndex = (
  allNotifications: AccountNotifications[],
  notification: Notification,
): number => {
  return allNotifications.findIndex(
    (accountNotifications) =>
      getAccountUUID(accountNotifications.account) ===
      getAccountUUID(notification.account),
  );
};

/**
 * Find notifications that exist in newNotifications but not in previousNotifications
 */
export const getNewNotifications = (
  previousNotifications: AccountNotifications[],
  newNotifications: AccountNotifications[],
): Notification[] => {
  return newNotifications.flatMap((accountNotifications) => {
    const accountPreviousNotifications = previousNotifications.find(
      (item) =>
        getAccountUUID(item.account) ===
        getAccountUUID(accountNotifications.account),
    );

    if (!accountPreviousNotifications) {
      return accountNotifications.notifications;
    }

    const previousIds = new Set(
      accountPreviousNotifications.notifications.map((item) => item.id),
    );

    return accountNotifications.notifications.filter(
      (notification) => !previousIds.has(notification.id),
    );
  });
};
