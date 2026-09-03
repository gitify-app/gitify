import type { GitifyNotification, Link } from '../../types';

import { rendererLogError, toError } from '../core/logger';
import { forAccount, getAdapter } from '../forges/registry';

export function generateNotificationReferrerId(notification: GitifyNotification): string {
  const raw = `018:NotificationThread${notification.id}:${notification.account.user?.id}`;
  return btoa(raw);
}

export async function generateNotificationWebUrl(notification: GitifyNotification): Promise<Link> {
  const url = new URL(getAdapter(notification.account).getDisplayHelpers(notification).defaultUrl);

  if (notification.subject.htmlUrl) {
    url.href = notification.subject.htmlUrl;
  } else {
    try {
      const followTarget =
        notification.subject.latestCommentUrl ?? notification.subject.url ?? null;
      if (followTarget) {
        const response = await forAccount(notification.account).followUrl<{ html_url: string }>(
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
