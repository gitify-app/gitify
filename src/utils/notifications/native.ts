import { APPLICATION } from '../../shared/constants';

import type { Notification } from '../../typesGitHub';
import { isTauriEnvironment } from '../environment';
import { generateGitHubWebUrl } from '../helpers';

export async function raiseNativeNotification(notifications: Notification[]) {
  if (!isTauriEnvironment()) {
    // Browser fallback - use browser notifications
    if ('Notification' in window && Notification.permission === 'granted') {
      if (notifications.length === 1) {
        const notification = notifications[0];
        new Notification(notification.repository.full_name, {
          body: notification.subject.title,
        });
      } else {
        new Notification(APPLICATION.NAME, {
          body: `You have ${notifications.length} notifications`,
        });
      }
    }
    return;
  }

  let title: string;
  let body: string;
  let url: string | undefined;

  if (notifications.length === 1) {
    const notification = notifications[0];
    title = window.gitify.platform.isWindows()
      ? ''
      : notification.repository.full_name;
    body = notification.subject.title;
    url = await generateGitHubWebUrl(notification);
  } else {
    title = APPLICATION.NAME;
    body = `You have ${notifications.length} notifications`;
  }

  return window.gitify.raiseNativeNotification(title, body, url);
}
