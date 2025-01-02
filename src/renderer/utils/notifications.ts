import path from 'node:path';

import { logError, logWarn } from '../../shared/logger';
import type {
  AccountNotifications,
  GitifyState,
  SettingsState,
} from '../types';
import { type GitifySubject, Notification } from '../typesGitHub';
import { listNotificationsForAuthenticatedUser } from './api/client';
import { determineFailureType } from './api/errors';
import { getAccountUUID } from './auth/utils';
import { hideWindow, showWindow, updateTrayIcon } from './comms';
import { Constants } from './constants';
import { openNotification } from './links';
import { isWindows } from './platform';
import { getGitifySubjectDetails } from './subject';

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

export const triggerNativeNotifications = (
  previousNotifications: AccountNotifications[],
  newNotifications: AccountNotifications[],
  state: GitifyState,
) => {
  const diffNotifications = newNotifications
    .map((accountNotifications) => {
      const accountPreviousNotifications = previousNotifications.find(
        (item) =>
          getAccountUUID(item.account) ===
          getAccountUUID(accountNotifications.account),
      );

      if (!accountPreviousNotifications) {
        return accountNotifications.notifications;
      }

      const accountPreviousNotificationsIds =
        accountPreviousNotifications.notifications.map((item) => item.id);

      const accountNewNotifications = accountNotifications.notifications.filter(
        (item) => {
          return !accountPreviousNotificationsIds.includes(`${item.id}`);
        },
      );

      return accountNewNotifications;
    })
    .reduce((acc, val) => acc.concat(val), []);

  setTrayIconColor(newNotifications);

  // If there are no new notifications just stop there
  if (!diffNotifications.length) {
    return;
  }

  if (state.settings.playSound) {
    raiseSoundNotification();
  }

  if (state.settings.showNotifications) {
    raiseNativeNotification(diffNotifications);
  }
};

export const raiseNativeNotification = (notifications: Notification[]) => {
  let title: string;
  let body: string;

  if (notifications.length === 1) {
    const notification = notifications[0];
    title = isWindows() ? '' : notification.repository.full_name;
    body = notification.subject.title;
  } else {
    title = 'Gitify';
    body = `You have ${notifications.length} notifications.`;
  }

  const nativeNotification = new Notification(title, {
    body,
    silent: true,
  });

  nativeNotification.onclick = () => {
    if (notifications.length === 1) {
      hideWindow();
      openNotification(notifications[0]);
    } else {
      showWindow();
    }
  };

  return nativeNotification;
};

export const raiseSoundNotification = () => {
  const audio = new Audio(
    path.join(
      __dirname,
      '..',
      'assets',
      'sounds',
      Constants.NOTIFICATION_SOUND,
    ),
  );
  audio.volume = 0.2;
  audio.play();
};

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

export function filterNotifications(
  notifications: Notification[],
  settings: SettingsState,
): Notification[] {
  return notifications.filter((notification) => {
    if (settings.hideBots && notification.subject?.user?.type === 'Bot') {
      return false;
    }

    if (
      settings.filterReasons.length > 0 &&
      !settings.filterReasons.includes(notification.reason)
    ) {
      return false;
    }

    return true;
  });
}
