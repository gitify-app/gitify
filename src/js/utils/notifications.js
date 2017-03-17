import { reOpenWindow, openExternalLink } from '../utils/comms';
import Helpers from '../utils/helpers';

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
  setup(notifications, settings) {
    // If there are no new notifications just stop there
    if (!notifications.length) { return; }

    if (settings.get('playSound')) {
      this.raiseSoundNotification();
    }

    if (settings.get('showNotifications')) {
      this.raiseNativeNotification(settings.isEnterprise, notifications);
    }
  },

  raiseNativeNotification(isEnterprise, notifications) {
    const newCount = notifications.length;
    const title = (newCount === 1 ? 'Gitify - ' + notifications[0].repository.full_name : 'Gitify');
    const body = (newCount === 1 ? notifications[0].subject.title : 'You\'ve got ' + newCount + ' notifications.');

    const nativeNotification = new Notification(title, {
      body: body,
      icon: newCount === 1 ? getNotificationIcon(notifications[0].subject.type) : false,
      silent: true
    });

    nativeNotification.onclick = function () {
      if (newCount === 1) {
        var url = Helpers.generateGitHubUrl(isEnterprise, notifications[0].subject.url);
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
  }
};
