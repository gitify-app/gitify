import { ipcRenderer } from 'electron';
import { Notification } from '../typesGitHub';
import { openInBrowser } from '../utils/helpers';
import { updateTrayIcon } from './comms';

import type { AccountNotifications, AuthState, SettingsState } from '../types';
import { listNotificationsForAuthenticatedUser } from './api/client';
import { getGitifySubjectDetails } from './subject';

export const setTrayIconColor = (notifications: AccountNotifications[]) => {
  const allNotificationsCount = getNotificationCount(notifications);

  updateTrayIcon(allNotificationsCount);
};

export function getNotificationCount(notifications: AccountNotifications[]) {
  return notifications.reduce(
    (memo, acc) => memo + acc.notifications.length,
    0,
  );
}

export const triggerNativeNotifications = (
  previousNotifications: AccountNotifications[],
  newNotifications: AccountNotifications[],
  settings: SettingsState,
  accounts: AuthState,
) => {
  const diffNotifications = newNotifications
    .map((accountNotifications) => {
      const accountPreviousNotifications = previousNotifications.find(
        (item) =>
          item.account.hostname === accountNotifications.account.hostname,
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

  if (settings.playSound) {
    raiseSoundNotification();
  }

  if (settings.showNotifications) {
    raiseNativeNotification(diffNotifications, accounts);
  }
};

export const raiseNativeNotification = (
  notifications: Notification[],
  accounts: AuthState,
) => {
  let title: string;
  let body: string;

  if (notifications.length === 1) {
    const notification = notifications[0];
    title = `${process.platform !== 'win32' ? 'Gitify - ' : ''}${
      notification.repository.full_name
    }`;
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
      ipcRenderer.send('hide-window');
      openInBrowser(notifications[0]);
    } else {
      ipcRenderer.send('reopen-window');
    }
  };

  return nativeNotification;
};

export const raiseSoundNotification = () => {
  const audio = new Audio('assets/sounds/clearly.mp3');
  audio.volume = 0.2;
  audio.play();
};

function getNotifications(auth: AuthState, settings: SettingsState) {
  return auth.accounts.map((account) => {
    return {
      account,
      notifications: listNotificationsForAuthenticatedUser(account, settings),
    };
  });
}

export async function getAllNotifications(
  auth: AuthState,
  settings: SettingsState,
): Promise<AccountNotifications[]> {
  const responses = await Promise.all([...getNotifications(auth, settings)]);

  const notifications: AccountNotifications[] = await Promise.all(
    responses
      .filter((response) => !!response)
      .map(async (accountNotifications) => {
        let notifications = (await accountNotifications.notifications).data.map(
          (notification: Notification) => ({
            ...notification,
            account: accountNotifications.account,
          }),
        );

        notifications = await enrichNotifications(
          notifications,
          auth,
          settings,
        );

        notifications = filterNotifications(notifications, settings);

        return {
          account: accountNotifications.account,
          notifications: notifications,
        };
      }),
  );

  return notifications;
}

export async function enrichNotifications(
  notifications: Notification[],
  accounts: AuthState,
  settings: SettingsState,
): Promise<Notification[]> {
  if (!settings.detailedNotifications) {
    return notifications;
  }

  const enrichedNotifications = await Promise.all(
    notifications.map(async (notification: Notification) => {
      const additionalSubjectDetails =
        await getGitifySubjectDetails(notification);

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
    if (!settings.showBots && notification.subject?.user?.type === 'Bot') {
      return false;
    }
    return true;
  });
}
