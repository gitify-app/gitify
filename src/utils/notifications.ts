import { ipcRenderer } from 'electron';
import { Notification } from '../typesGithub';
import { openInBrowser } from '../utils/helpers';
import { updateTrayIcon } from './comms';

import type { AccountNotifications, AuthState, SettingsState } from '../types';

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
    .map((account) => {
      const accountPreviousNotifications = previousNotifications.find(
        (item) => item.hostname === account.hostname,
      );

      if (!accountPreviousNotifications) {
        return account.notifications;
      }

      const accountPreviousNotificationsIds =
        accountPreviousNotifications.notifications.map((item) => item.id);

      const accountNewNotifications = account.notifications.filter((item) => {
        return !accountPreviousNotificationsIds.includes(`${item.id}`);
      });

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
      openInBrowser(notifications[0], accounts);
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
