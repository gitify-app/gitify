const { remote } = require('electron');

import { generateGitHubWebUrl } from '../utils/helpers';
import { reOpenWindow, openExternalLink } from '../utils/comms';
import { Notification } from '../../types/github';
import { SettingsState } from '../../types/reducers';

export default {
  setup(
    notifications: Notification[],
    notificationsCount,
    settings: SettingsState
  ) {
    // If there are no new notifications just stop there
    if (!notificationsCount) {
      return;
    }

    if (settings.playSound) {
      this.raiseSoundNotification();
    }

    if (settings.showNotifications) {
      this.raiseNativeNotification(notifications, notificationsCount);
    }
  },

  raiseNativeNotification(notifications, count: number) {
    let title: string;
    let body: string;
    let notificationUrl: string | null;

    if (count === 1) {
      const notification: Notification = notifications.find(
        (obj) => obj.length > 0
      )[0];
      title = `Gitify - ${notification.repository.full_name}`;
      body = notification.subject.title;
      notificationUrl = notification.subject.url;
    } else {
      title = 'Gitify';
      body = `You have ${count} notifications.`;
    }

    const nativeNotification = new Notification(title, {
      body,
      silent: true,
    });

    nativeNotification.onclick = function () {
      if (count === 1) {
        const appWindow = remote.getCurrentWindow();
        appWindow.hide();

        // Some Notification types from GitHub are missing urls in their subjects.
        if (notificationUrl) {
          const url = generateGitHubWebUrl(notificationUrl);
          openExternalLink(url);
        }
      } else {
        reOpenWindow();
      }
    };

    return nativeNotification;
  },

  raiseSoundNotification() {
    const audio = new Audio('assets/sounds/clearly.mp3');
    audio.volume = 0.2;
    audio.play();
  },
};
