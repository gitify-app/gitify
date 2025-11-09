import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';

import type { SettingsState } from '../../../types';
import type {
  GitifySubject,
  Notification,
  SubjectType,
} from '../../../typesGitHub';

export interface NotificationTypeHandler {
  readonly type?: SubjectType;

  /**
   * Enrich a notification. Settings may be unused for some handlers.
   */
  enrich(
    notification: Notification,
    settings: SettingsState,
  ): Promise<GitifySubject>;

  /**
   * Return the icon component for this notification type.
   */
  iconType(notification: Notification): FC<OcticonProps> | null;

  /**
   * Return the icon color for this notification type.
   */
  iconColor(notification: Notification): string | undefined;

  /**
   * Return the formatted notification type for this notification.
   */
  formattedNotificationType(notification: Notification): string;

  /**
   * Return the formatted notification number for this notification.
   */
  formattedNotificationNumber(notification: Notification): string;

  /**
   * Return the formatted notification title for this notification.
   */
  formattedNotificationTitle(notification: Notification): string;
}
