const { remote } = require('electron');

import { openInBrowser } from '../utils/helpers';
import { reOpenWindow, updateTrayIcon } from './comms';
import { Notification } from '../typesGithub';

import { AccountNotifications, SettingsState, AuthState } from '../types';

let markNotification: (accounts: AuthState, id: string, hostname: string) => Promise<void>;

export const setTrayIconColor = (notifications: AccountNotifications[]) => {
  const allNotificationsCount = notifications.reduce(
    (memo, acc) => memo + acc.notifications.length,
    0
  );

  updateTrayIcon(allNotificationsCount);
};

export const triggerNativeNotifications = (
  previousNotifications: AccountNotifications[],
  newNotifications: AccountNotifications[],
  settings: SettingsState,
  accounts: AuthState,
  markNotification_?: (accounts: AuthState, id: string, hostname: string) => Promise<void>
) => {
  markNotification ??= markNotification_;

  const diff = newNotifications
    .map((account) => {
      const accountPreviousNotifications = previousNotifications.find(
        (item) => item.hostname === account.hostname
      );

      if (!accountPreviousNotifications) {
        return { hostname: account.hostname, notifications: account.notifications };
      }

      const accountPreviousNotificationsIds = accountPreviousNotifications.notifications.map(
        (item) => item.id
      );

      const accountNewNotifications = account.notifications.filter((item) => {
        return !accountPreviousNotificationsIds.includes(`${item.id}`);
      });

      return { hostname: account.hostname, notifications: accountNewNotifications };
    })

  const diffNotifications = diff.flatMap(o => o.notifications)

  setTrayIconColor(newNotifications);

  // If there are no new notifications just stop there
  if (!diffNotifications.length) {
    return;
  }

  if (settings.playSound) {
    raiseSoundNotification();
  }

  if (settings.showNotifications) {
    raiseNativeNotification(diffNotifications, settings, accounts, diff[0].hostname);
  }
};

export const raiseNativeNotification = (
  notifications: Notification[],
  settings: SettingsState,
  accounts: AuthState,
  hostname?: string
) => {
  let title: string;
  let body: string;

  if (notifications.length === 1) {
    const notification = notifications[0];
    title = `Gitify - ${notification.repository.full_name}`;
    body = notification.subject.title;
  } else {
    title = 'Gitify';
    body = `You have ${notifications.length} notifications.`;
  }

  const nativeNotification = new Notification(title, {
    body,
    silent: true,
  });

  nativeNotification.onclick = function () {
    if (notifications.length === 1) {
      remote.getCurrentWindow().hide();
      openInBrowser(notifications[0], accounts);
      if (settings.markOnClick) {
        markNotification?.(accounts, notifications[0].id, hostname);
      }
    } else {
      reOpenWindow();
    }
  };

  return nativeNotification;
};

export const raiseSoundNotification = () => {
  const audio = new Audio('assets/sounds/clearly.mp3');
  audio.volume = 0.2;
  audio.play();
};
