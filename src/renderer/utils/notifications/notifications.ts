import { logError, logWarn } from '../../../shared/logger';
import type { AccountNotifications, GitifyState } from '../../types';
import type { GitifySubject, Notification } from '../../typesGitHub';
import { listNotificationsForAuthenticatedUser } from '../api/client';
import { determineFailureType } from '../api/errors';
import { updateTrayIcon } from '../comms';
import { getGitifySubjectDetails } from '../subject';
import { filterNotifications } from './filter';

export function setTrayIconColor(notifications: AccountNotifications[]) {
  const allNotificationsCount = getNotificationCount(notifications);

  updateTrayIcon(allNotificationsCount);
}

export function getNotificationCount(notifications: AccountNotifications[]) {
  return notifications.reduce(
    (memo, acc) => memo + acc.notifications.length,
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
  const responses = await Promise.all([...getNotifications(state)]);

  const notifications: AccountNotifications[] = await Promise.all(
    responses
      .filter((response) => !!response)
      .map(async (accountNotifications) => {
        try {
          let notifications = (
            await accountNotifications.notifications
          ).data.map((notification: Notification) => ({
            ...notification,
            account: accountNotifications.account,
          }));

          notifications = await enrichNotifications(notifications, state);

          notifications = filterNotifications(notifications, state.settings);

          return {
            account: accountNotifications.account,
            notifications: notifications,
            error: null,
          };
        } catch (err) {
          logError(
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

  return notifications;
}

export async function enrichNotifications(
  notifications: Notification[],
  state: GitifyState,
): Promise<Notification[]> {
  if (!state.settings.detailedNotifications) {
    return notifications;
  }

  const enrichedNotifications = await Promise.all(
    notifications.map(async (notification: Notification) => {
      let additionalSubjectDetails: GitifySubject = {};

      try {
        additionalSubjectDetails = await getGitifySubjectDetails(notification);
      } catch (err) {
        logError(
          'enrichNotifications',
          'failed to enrich notification details for',
          err,
          notification,
        );

        logWarn(
          'enrichNotifications',
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
    }),
  );

  return enrichedNotifications;
}
