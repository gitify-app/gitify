import { APPLICATION } from '../../../shared/constants';

import type { GitifyNotification } from '../../types';

import { generateGitHubWebUrl } from '../notifications/url';

/**
 * Raises a native OS notification.
 *
 * For a single notification, the message is used as the title (non-Windows) and the
 * formatted footer text is used as the body. For multiple notifications, a generic count
 * summary is shown instead.
 *
 * @param notifications - The notifications to surface as a native OS notification.
 */
export async function raiseNativeNotification(
  notifications: GitifyNotification[],
) {
  let title: string;
  let body: string;
  let url: string = null;

  if (notifications.length === 1) {
    const notification = notifications[0];
    title = window.gitify.platform.isWindows()
      ? ''
      : notification.repository.fullName;
    body = notification.subject.title;
    url = await generateGitHubWebUrl(notification);
  } else {
    title = APPLICATION.NAME;
    body = `You have ${notifications.length} notifications`;
  }

  return window.gitify.raiseNativeNotification(title, body, url);
}
