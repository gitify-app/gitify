import { APPLICATION } from '../../../shared/constants';

import type { GitifyNotification } from '../../types';

import { generateNotificationWebUrl } from '../notifications/url';

/**
 * Raises a native OS notification.
 *
 * For a single notification, the repository full name is the title, the subject
 * title is the body, and the generated web URL is the click target. For
 * multiple notifications, the app name is the title and the body summarizes the
 * notification count.
 *
 * @param notifications - The notifications to surface as a native OS notification.
 */
export async function raiseNativeNotification(notifications: GitifyNotification[]) {
  let title: string;
  let body: string;
  let url: string | null = null;

  if (notifications.length === 1) {
    const notification = notifications[0];
    title = notification.repository.fullName;
    body = notification.subject.title;
    url = await generateNotificationWebUrl(notification);
  } else {
    title = APPLICATION.NAME;
    body = `You have ${notifications.length} notifications`;
  }

  return window.gitify.raiseNativeNotification(title, body, url ?? undefined);
}
