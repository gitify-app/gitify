const { remote } = require('electron');

import { reOpenWindow, openExternalLink } from '../utils/comms';
import { generateGitHubWebUrl } from '../utils/helpers';

export function getNotificationIcon(type) {
  switch (type) {
    case 'Issue':
      return 'images/notifications/issue.png';
    case 'Commit':
      return 'images/notifications/commit.png';
    case 'PullRequest':
      return 'images/notifications/pull-request.png';
    case 'Release':
      return 'images/notifications/release.png';
    default:
      return 'images/notifications/gitify.png';
  }
}

export default {
  setup(notifications, notificationsCount, settings) {
    // If there are no new notifications just stop there
    if (!notificationsCount) {
      return;
    }

    if (settings.get('playSound')) {
      this.raiseSoundNotification();
    }

    if (settings.get('showNotifications')) {
      this.raiseNativeNotification(notifications, notificationsCount);
    }
  },

  raiseNativeNotification(notifications, count) {
    let title, body, icon, notificationUrl;

    if (count === 1) {
      const notification = notifications.find(obj => !obj.isEmpty()).first();
      title = `Gitify - ${notification.getIn(['repository', 'full_name'])}`;
      body = notification.getIn(['subject', 'title']);
      icon = getNotificationIcon(notification.getIn(['subject', 'type']));
      notificationUrl = notification.getIn(['subject', 'url']);
    } else {
      title = 'Gitify';
      body = `You've got ${count} notifications.`;
      icon = false;
    }

    const nativeNotification = new Notification(title, {
      body,
      icon,
      silent: true,
    });

    nativeNotification.onclick = function() {
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
    const audio = new Audio('sounds/digi.wav');
    audio.play();
  },
};
