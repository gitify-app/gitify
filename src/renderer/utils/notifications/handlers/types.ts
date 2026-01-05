import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';

import type {
  GitifyNotification,
  GitifySubject,
  Link,
  SettingsState,
  SubjectType,
  UserType,
} from '../../../types';

export interface NotificationTypeHandler {
  readonly type?: SubjectType;

  /**
   * Whether the notification handler supports enrichment via merged GraphQL query.
   */
  readonly supportsMergedQueryEnrichment?: boolean;

  /**
   * Enriches a base notification with additional information (state, author, metrics, etc).
   *
   * @param notification The base notification being enriched
   * @param settings The app settings, which for some handlers may not be used during enrichment.
   * @param fetchedData Previously fetched enrichment data (upstream).  If present, then enrich will skip fetching detailed data inline.
   */
  enrich(
    notification: GitifyNotification,
    settings: SettingsState,
    fetchedData?: unknown,
  ): Promise<Partial<GitifySubject>>;

  /**
   * Return the icon component for this notification type.
   */
  iconType(notification: GitifyNotification): FC<OcticonProps>;

  /**
   * Return the icon color for this notification type.
   */
  iconColor(notification: GitifyNotification): string;

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

  /**
   * Default user type for notification type.
   */
  defaultUserType(): UserType;
}
