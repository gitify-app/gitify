import type {
  AccountNotifications,
  GitifyState,
  SettingsState,
} from '../../types';
import type { GitifySubject, Notification } from '../../typesGitHub';
import { listNotificationsForAuthenticatedUser } from '../api/client';
import { determineFailureType } from '../api/errors';
import { updateTrayColor } from '../comms';
import { rendererLogError, rendererLogWarn } from '../logger';
import {
  filterBaseNotifications,
  filterDetailedNotifications,
} from './filters/filter';
import {
  flattenRepoGroups,
  groupNotificationsByRepository,
  isGroupByRepository,
} from './group';
import { createNotificationHandler } from './handlers';

export function setTrayIconColor(notifications: AccountNotifications[]) {
  const allNotificationsCount = getNotificationCount(notifications);

  updateTrayColor(allNotificationsCount);
}

export function getNotificationCount(notifications: AccountNotifications[]) {
  return notifications.reduce(
    (sum, account) => sum + account.notifications.length,
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

export function stabilizeNotificationsOrder(
  notifications: AccountNotifications[],
  settings: SettingsState,
) {
  if (isGroupByRepository(settings)) {
    const repoGroups = groupNotificationsByRepository(notifications);
    const flattened = flattenRepoGroups(repoGroups);

    let orderIndex = 0;

    for (const n of flattened) {
      n.order = orderIndex++;
    }
  } else {
    // Non-repository grouping: assign sequential order across all notifications
    let orderIndex = 0;

    notifications.forEach((accountNotifications) => {
      accountNotifications.notifications.forEach((notification) => {
        notification.order = orderIndex++;
      });
    });
  }
}
