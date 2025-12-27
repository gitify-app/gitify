import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';

import type { GitifySubject, Link, SettingsState } from '../../../types';
import type { Notification, Subject, SubjectType } from '../../../typesGitHub';

export type GraphQLMergedQueryConfig = {
  queryFragment: string;
  responseFragment: string;
  extras: Array<{
    name: string;
    type: string;
    defaultValue: number | boolean;
  }>;
};

export interface NotificationTypeHandler<TFragment = unknown> {
  readonly type?: SubjectType;

  mergeQueryConfig(): GraphQLMergedQueryConfig;

  query(notification: Notification): { query; variables } | null;

  /**
   * Fetch remote data (if needed) and enrich a notification.
   */
  fetchAndEnrich(
    notification: Notification,
    settings: SettingsState,
  ): Promise<GitifySubject>;

  /**
   * Enrich a notification. Settings may be unused for some handlers.
   */
  enrich(
    notification: Notification,
    settings?: SettingsState,
    fetchedData?: TFragment,
  ): Promise<GitifySubject>;

  /**
   * Return the icon component for this notification type.
   */
  iconType(subject: Subject): FC<OcticonProps> | null;

  /**
   * Return the icon color for this notification type.
   */
  iconColor(subject: Subject): string | undefined;

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

  /**
   * Default url for notification type.
   */
  defaultUrl(notification: Notification): Link;
}
