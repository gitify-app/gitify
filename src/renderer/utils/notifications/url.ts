import type { GitifyNotification, Link } from '../../types';

import { rendererLogError, toError } from '../core/logger';
import { getHtmlUrl } from '../forges/github/client';
// TODO(multi-forge): the handler factory lives under the GitHub adapter
// because every handler talks to GitHub APIs. Its display-side helpers
// (defaultUrl, etc.) are technically forge-agnostic — a future refactor
// should split that surface so this file does not depend on a forge.
import { createNotificationHandler } from '../forges/github/handlers';

export function generateNotificationReferrerId(
  notification: GitifyNotification,
): string {
  const raw = `018:NotificationThread${notification.id}:${notification.account.user?.id}`;
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
        toError(err),
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
