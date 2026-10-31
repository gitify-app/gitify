import { APPLICATION } from '../../../shared/constants';
import type { INativeNotificationPayload } from '../../../shared/events';
import {
  getNativeNotificationId,
  NATIVE_NOTIFICATION_SUMMARY_ID,
} from '../../../shared/nativeNotifications';

import type { GitifyNotification } from '../../types';

import i18n from '../../i18n';
import { getAccountUUID } from '../auth/utils';

/** Maximum individual notifications published for one batch. */
export const NATIVE_NOTIFICATION_BATCH_CAP = 5;

/**
 * Build the structured payload for one notification.
 *
 * @param notification - The notification to publish.
 * @returns The main-process payload.
 */
export function buildNativeNotificationPayload(
  notification: GitifyNotification,
): INativeNotificationPayload {
  const accountUUID = getAccountUUID(notification.account);
  const actor = notification.subject.user?.login ?? notification.subject.author?.login;
  const subtitle = [notification.reason.title, actor ? `@${actor}` : '']
    .filter(Boolean)
    .join(' · ');
  const identifier = notification.display.identifier;
  const body =
    identifier && !notification.subject.title.includes(identifier)
      ? `${notification.subject.title} (${identifier})`
      : notification.subject.title;

  return {
    id: getNativeNotificationId(accountUUID, notification.id),
    title: notification.repository.fullName,
    subtitle: subtitle || undefined,
    body,
    actionLabel: notification.unread
      ? i18n.t('notifications.mark_as_read', 'Mark as read')
      : undefined,
  };
}

/**
 * Summary text for a batch of notifications.
 *
 * @param count - The number of new notifications.
 * @returns The translated summary body.
 */
function getSummaryBody(count: number): string {
  return i18n.t('native.summary_body_other', 'You have {{count}} notifications', { count });
}

/**
 * Publish new notifications, falling back to one summary above the cap.
 *
 * @param notifications - The new notifications to publish.
 * @returns The published payloads, so the host can track them for removal.
 */
export async function raiseNativeNotification(
  notifications: GitifyNotification[],
): Promise<INativeNotificationPayload[]> {
  if (notifications.length === 0) {
    return [];
  }

  if (notifications.length > NATIVE_NOTIFICATION_BATCH_CAP) {
    const summary: INativeNotificationPayload = {
      id: NATIVE_NOTIFICATION_SUMMARY_ID,
      title: APPLICATION.NAME,
      body: getSummaryBody(notifications.length),
    };

    window.gitify.nativeNotifications.show(summary);

    return [summary];
  }

  const published = notifications.map(buildNativeNotificationPayload);

  for (const payload of published) {
    // Notifications must be published in order.
    window.gitify.nativeNotifications.show(payload);
  }

  return published;
}
