import { APPLICATION } from '../../../shared/constants';
import type {
  INativeNotificationAction,
  INativeNotificationPayload,
  NativeNotificationActionId,
} from '../../../shared/events';
import {
  getNativeNotificationGroupId,
  getNativeNotificationId,
  NATIVE_NOTIFICATION_SUMMARY_ID,
} from '../../../shared/nativeNotifications';

import type { GitifyNotification } from '../../types';
import { NativeNotificationStyle } from '../../types';

import i18n from '../../i18n';
import { isMarkAsDoneFeatureSupported, isUnsubscribeThreadSupported } from '../api/features';
import { getAccountUUID } from '../auth/utils';
import { generateNotificationWebUrl } from '../notifications/url';

/** Maximum individual notifications published for one batch. */
export const NATIVE_NOTIFICATION_BATCH_CAP = 5;

export interface NativeNotificationOptions {
  style: NativeNotificationStyle;
  actions: boolean;
  keepVisible: boolean;
}

/**
 * A notification handed to the operating system, plus the web URL the
 * renderer keeps locally as a click fallback (it never crosses IPC).
 */
export interface PublishedNativeNotification {
  payload: INativeNotificationPayload;
  url?: string;
}

/**
 * Translated label for an action button.
 *
 * @param id - The action.
 * @returns The button text in the current language.
 */
function getActionLabel(id: NativeNotificationActionId): string {
  switch (id) {
    case 'show':
      return i18n.t('native.action.show', 'Show notifications');
    case 'read':
      return i18n.t('native.action.read', 'Mark as read');
    case 'done':
      return i18n.t('native.action.done', 'Mark as done');
    case 'unsubscribe':
    default:
      return i18n.t('native.action.unsubscribe', 'Unsubscribe');
  }
}

function toAction(id: NativeNotificationActionId): INativeNotificationAction {
  return { id, label: getActionLabel(id) };
}

/**
 * Build the structured payload for one notification.
 *
 * @param notification - The notification to publish.
 * @param options - The user's native notification preferences.
 * @returns The payload for the main process and the local click-fallback URL.
 */
export async function buildNativeNotificationPayload(
  notification: GitifyNotification,
  options: NativeNotificationOptions,
): Promise<PublishedNativeNotification> {
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

  let url: string | undefined;

  try {
    url = await generateNotificationWebUrl(notification);
  } catch {
    url = undefined;
  }

  const actions: NativeNotificationActionId[] = [];

  if (options.actions) {
    if (notification.unread) {
      actions.push('read');
    }

    if (notification.unread && isMarkAsDoneFeatureSupported(notification.account)) {
      actions.push('done');
    }

    if (isUnsubscribeThreadSupported(notification.account)) {
      actions.push('unsubscribe');
    }
  }

  return {
    payload: {
      id: getNativeNotificationId(accountUUID, notification.id),
      groupId: getNativeNotificationGroupId(accountUUID, notification.repository.fullName),
      groupTitle: notification.repository.fullName,
      title: notification.repository.fullName,
      subtitle: subtitle || undefined,
      body,
      actions: actions.map(toAction),
      keepVisible: options.keepVisible,
    },
    url,
  };
}

/**
 * Summary text for a batch of notifications.
 *
 * @param count - The number of new notifications.
 * @returns The translated summary body.
 */
function getSummaryBody(count: number): string {
  return count === 1
    ? i18n.t('native.summary_body_one', 'You have 1 notification')
    : i18n.t('native.summary_body_other', 'You have {{count}} notifications', { count });
}

/**
 * Publish new notifications according to the user's style and the batch cap.
 *
 * @param notifications - The new notifications to publish.
 * @param options - The user's native notification preferences.
 * @returns The published notifications, so the host can track them for removal.
 */
export async function raiseNativeNotification(
  notifications: GitifyNotification[],
  options: NativeNotificationOptions,
): Promise<PublishedNativeNotification[]> {
  if (notifications.length === 0) {
    return [];
  }

  if (
    options.style === NativeNotificationStyle.SUMMARY ||
    notifications.length > NATIVE_NOTIFICATION_BATCH_CAP
  ) {
    const summary: INativeNotificationPayload = {
      id: NATIVE_NOTIFICATION_SUMMARY_ID,
      title: APPLICATION.NAME,
      body: getSummaryBody(notifications.length),
      actions: options.actions ? [toAction('show')] : [],
      keepVisible: options.keepVisible,
    };

    await window.gitify.nativeNotifications.show(summary);

    return [{ payload: summary }];
  }

  const published: PublishedNativeNotification[] = [];

  for (const notification of notifications) {
    // Notifications must be published in order, so await each one.
    const built = await buildNativeNotificationPayload(notification, options); // NOSONAR
    await window.gitify.nativeNotifications.show(built.payload); // NOSONAR
    published.push(built);
  }

  return published;
}
