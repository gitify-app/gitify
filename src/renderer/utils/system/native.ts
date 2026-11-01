import { APPLICATION } from '../../../shared/constants';
import type { INativeNotificationPayload } from '../../../shared/events';
import {
  getNativeNotificationId,
  NATIVE_NOTIFICATION_SUMMARY_ID,
} from '../../../shared/nativeNotifications';

import type { GitifyNotification } from '../../types';

import i18n from '../../i18n';
import { getAccountUUID } from '../auth/utils';

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
  const context = [notification.reason.title, actor ? `@${actor}` : ''].filter(Boolean).join(' · ');
  const identifier = notification.display.identifier;
  const body =
    identifier && !notification.display.title.includes(identifier)
      ? `${notification.display.title} (${identifier})`
      : notification.display.title;

  return {
    id: getNativeNotificationId(accountUUID, notification.id),
    title: notification.repository.fullName,
    subtitle: context || undefined,
    body,
    actionLabel: notification.unread
      ? i18n.t('notifications.mark_as_read', 'Mark as read')
      : undefined,
  };
}

/**
 * Publish new notifications, preserving the existing single-versus-summary
 * alert policy.
 *
 * @param notifications - The new notifications to publish.
 * @returns The published payloads, so the host can track them for removal.
 */
export function raiseNativeNotification(
  notifications: GitifyNotification[],
): INativeNotificationPayload[] {
  if (notifications.length === 0) {
    return [];
  }

  if (notifications.length > 1) {
    const summary: INativeNotificationPayload = {
      id: NATIVE_NOTIFICATION_SUMMARY_ID,
      title: APPLICATION.NAME,
      body: i18n.t('native.summary_body_other', 'You have {{count}} notifications', {
        count: notifications.length,
      }),
    };

    window.gitify.nativeNotifications.show(summary);

    return [summary];
  }

  const payload = buildNativeNotificationPayload(notifications[0]);

  window.gitify.nativeNotifications.show(payload);

  return [payload];
}
