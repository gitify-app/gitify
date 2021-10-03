const { remote } = require('electron');

import { generateGitHubWebUrl } from './helpers';
import { reOpenWindow, openExternalLink, updateTrayIcon } from './comms';
import { Notification, User } from '../typesGithub';

import { AccountNotifications, SettingsState } from '../types';

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
  user: User
) => {
  const diffNotifications = newNotifications
    .map((account) => {
      const accountPreviousNotifications = previousNotifications.find(
        (item) => item.hostname === account.hostname
      );

      if (!accountPreviousNotifications) {
        return account.notifications;
      }

      const accountPreviousNotificationsIds = accountPreviousNotifications.notifications.map(
        (item) => item.id
      );

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
    raiseNativeNotification(diffNotifications, user?.id);
  }
};

export const raiseNativeNotification = (
  notifications: Notification[],
  userId?: number
) => {
  let title: string;
  let body: string;
  let notificationUrl: string | null;

  if (notifications.length === 1) {
    const notification = notifications[0];
    title = `Gitify - ${notification.repository.full_name}`;
    body = notification.subject.title;
    notificationUrl = notification.subject.url;
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
      const appWindow = remote.getCurrentWindow();
      appWindow.hide();

      // Some Notification types from GitHub are missing urls in their subjects.
      if (notificationUrl) {
        const { subject, id } = notifications[0];
        const url = generateGitHubWebUrl(subject.url, id, userId);
        openExternalLink(url);
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
