import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';

import type {
  GitifyNotification,
  GitifySubject,
  Link,
  SettingsState,
} from '../../../types';
import type { SubjectType } from '../../../typesGitHub';

export interface NotificationTypeHandler {
  readonly type?: SubjectType;

  /**
   * Enrich a notification. Settings may be unused for some handlers.
   */
  enrich(
    notification: GitifyNotification,
    settings: SettingsState,
  ): Promise<Partial<GitifySubject>>;

  /**
   * Return the icon component for this notification type.
   */
  iconType(subject: GitifySubject): FC<OcticonProps> | null;

  /**
   * Return the icon color for this notification type.
   */
  iconColor(subject: GitifySubject): string | undefined;

  /**
   * Return the formatted notification type for this notification.
   */
  formattedNotificationType(notification: GitifyNotification): string;

  /**
   * Return the formatted notification number for this notification.
   */
  formattedNotificationNumber(notification: GitifyNotification): string;

  /**
   * Return the formatted notification title for this notification.
   */
  formattedNotificationTitle(notification: GitifyNotification): string;

  /**
   * Default url for notification type.
   */
  defaultUrl(notification: GitifyNotification): Link;
}
