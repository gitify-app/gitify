import type { GitifyNotification, Link } from '../../types';

import { rendererLogError, toError } from '../core/logger';
import { getAdapter } from '../forges/registry';

export function generateNotificationReferrerId(notification: GitifyNotification): string {
  const raw = `018:NotificationThread${notification.id}:${notification.account.user?.id}`;
  return btoa(raw);
}

export async function generateNotificationWebUrl(notification: GitifyNotification): Promise<Link> {
  const adapter = getAdapter(notification.account);
  const url = new URL(adapter.getDisplayHelpers(notification).defaultUrl);

  if (notification.subject.htmlUrl) {
    url.href = notification.subject.htmlUrl;
  } else {
    try {
      const followTarget =
        notification.subject.latestCommentUrl ?? notification.subject.url ?? null;
      if (followTarget) {
        const response = await adapter.followUrl<{ html_url: string }>(
          notification.account,
          followTarget,
        );
        url.href = response.html_url;
      }
    } catch (err) {
      rendererLogError(
        'generateNotificationWebUrl',
        'Failed to resolve specific notification html url for',
        toError(err),
        notification,
      );
    }
  }

  url.searchParams.set('notification_referrer_id', generateNotificationReferrerId(notification));

  return url.toString() as Link;
}
