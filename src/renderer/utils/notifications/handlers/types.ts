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
  readonly notification: Notification;

  /**
   * Enrich a notification. Settings may be unused for some handlers.
   */
  enrich(settings: SettingsState): Promise<GitifySubject>;

  /**
   * Return the icon component for this notification type.
   */
  iconType(): FC<OcticonProps> | null;

  /**
   * Return the icon color for this notification type.
   */
  iconColor(): string | undefined;

  /**
   * Return the formatted notification type for this notification.
   */
  formattedNotificationType(): string;

  /**
   * Return the formatted notification number for this notification.
   */
  formattedNotificationNumber(): string;

  /**
   * Return the formatted notification title for this notification.
   */
  formattedNotificationTitle(): string;
}
