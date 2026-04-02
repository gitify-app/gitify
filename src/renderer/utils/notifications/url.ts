import type { GitifyNotification, Link } from '../../types';

import { getHtmlUrl } from '../api/client';
import { rendererLogError } from '../core/logger';
import { createNotificationHandler } from './handlers';

export function generateNotificationReferrerId(
  notification: GitifyNotification,
): string {
  const raw = `018:NotificationThread${notification.id}:${notification.account.user!.id}`;
  return btoa(raw);
}

export async function generateGitHubWebUrl(
  notification: GitifyNotification,
): Promise<Link> {
  const handler = createNotificationHandler(notification);
  const url = new URL(handler.defaultUrl(notification));

  if (notification.subject.htmlUrl) {
    url.href = notification.subject.htmlUrl;
  } else {
    try {
      if (notification.subject.latestCommentUrl) {
        const response = await getHtmlUrl(
          notification.account,
          notification.subject.latestCommentUrl,
        );

        url.href = response.html_url;
      } else if (notification.subject.url) {
        const response = await getHtmlUrl(
          notification.account,
          notification.subject.url,
        );

        url.href = response.html_url;
      }
    } catch (err) {
      rendererLogError(
        'generateGitHubWebUrl',
        'Failed to resolve specific notification html url for',
        err as Error,
        notification,
      );
    }
  }

  url.searchParams.set(
    'notification_referrer_id',
    generateNotificationReferrerId(notification),
  );

  return url.toString() as Link;
}
