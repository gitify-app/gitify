const ipcRenderer = window.require('electron').ipcRenderer;
const shell = window.require('electron').shell;

import Helpers from '../utils/helpers';

export default {
  setup(notifications, settings) {
    // If there are no new notifications just stop there
    if (!notifications.length) { return; }

    if (settings.playSound) {
      this.raiseSoundNotification(notifications);
    }

    if (settings.showNotifications) {
      this.raiseNativeNotification(notifications);
    }
  },

  raiseNativeNotification(notifications) {
    const newCount = notifications.length;
    const title = (newCount === 1 ? 'Gitify - ' + notifications[0].repository.full_name : 'Gitify');
    const body = (newCount === 1 ? notifications[0].subject.title : 'You\'ve got ' + newCount + ' notifications.');

    var icon;
    if (newCount === 1) {
      switch (notifications[0].subject.type) {
        case 'Issue':
          icon = 'images/notifications/issue.png';
          break;
        case 'Commit':
          icon = 'images/notifications/commit.png';
          break;
        case 'PullRequest':
          icon = 'images/notifications/pull-request.png';
          break;
        case 'Release':
          icon = 'images/notifications/release.png';
          break;
        default:
          icon = 'images/notifications/gitify.png';
      }
    }

    const nativeNotification = new Notification(title, {
      body: body,
      icon: icon || false,
      silent: true
    });

    nativeNotification.onclick = function () {
      if (newCount === 1) {
        var url = Helpers.generateGitHubUrl(notifications[0].subject);
        shell.openExternal(url);
      } else {
        ipcRenderer.send('reopen-window');
      }
    };

    return nativeNotification;
  },

  raiseSoundNotification(notifications) {
    const audio = new Audio('sounds/digi.wav');
    audio.play();
  }
};
