import { APPLICATION } from '../../../shared/constants';
import type {
  INativeNotificationPayload,
  NativeNotificationActionId,
} from '../../../shared/events';
import {
  encodeNativeNotificationGroupIdentity,
  encodeNativeNotificationIdentity,
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
 * Build the structured payload for one notification. The main process treats
 * the identity as opaque; the renderer decodes it when routing interactions.
 */
export async function buildNativeNotificationPayload(
  notification: GitifyNotification,
  options: NativeNotificationOptions,
): Promise<INativeNotificationPayload> {
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
    id: encodeNativeNotificationIdentity(accountUUID, notification.id),
    groupId: encodeNativeNotificationGroupIdentity(accountUUID, notification.repository.fullName),
    groupTitle: notification.repository.fullName,
    title: notification.repository.fullName,
    subtitle: subtitle || undefined,
    body,
    url,
    actions,
    keepVisible: options.keepVisible,
  };
}

/**
 * Publish new notifications according to the user's style and the batch cap.
 *
 * Returns the payloads that were published so the host can track their
 * identities for later removal.
 */
export async function raiseNativeNotification(
  notifications: GitifyNotification[],
  options: NativeNotificationOptions,
): Promise<INativeNotificationPayload[]> {
  if (notifications.length === 0) {
    return [];
  }

  if (
    options.style === NativeNotificationStyle.SUMMARY ||
    notifications.length > NATIVE_NOTIFICATION_BATCH_CAP
  ) {
    const summary: INativeNotificationPayload = {
      id: 'summary',
      title: APPLICATION.NAME,
      body: i18n.t('native.summary_body', 'You have {{count}} notifications', {
        count: notifications.length,
      }),
      actions: options.actions ? ['show'] : [],
      keepVisible: options.keepVisible,
    };

    await window.gitify.nativeNotifications.show(summary);

    return [summary];
  }

  const published: INativeNotificationPayload[] = [];

  for (const notification of notifications) {
    // Notifications must be published in order, so await each one.
    const payload = await buildNativeNotificationPayload(notification, options); // NOSONAR
    await window.gitify.nativeNotifications.show(payload); // NOSONAR
    published.push(payload);
  }

  return published;
}
