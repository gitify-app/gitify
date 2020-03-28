const { remote } = require('electron');

import { generateGitHubWebUrl } from '../utils/helpers';
import { reOpenWindow, openExternalLink } from '../utils/comms';
import { SubjectType } from '../../types/github';
import { SettingsState } from '../../types/reducers';

export default {
  setup(notifications, notificationsCount, settings: SettingsState) {
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

  raiseNativeNotification(notifications, count) {
    let title, body, icon, notificationUrl;

    if (count === 1) {
      const notification = notifications.find((obj) => obj.length > 0)[0];
      title = `Gitify - ${notification.repository.full_name}`;
      body = notification.subject.title;
      notificationUrl = notification.subject.url;
    } else {
      title = 'Gitify';
      body = `You have got ${count} notifications.`;
    }

    const nativeNotification = new Notification(title, {
      body,
      silent: true,
    });

    nativeNotification.onclick = function () {
      if (count === 1) {
        const appWindow = remote.getCurrentWindow();
        const url = generateGitHubWebUrl(notificationUrl);

        appWindow.hide();
        openExternalLink(url);
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
