import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';

import type {
  GitifyNotification,
  GitifySubject,
  Link,
  SettingsState,
  SubjectType,
} from '../../../types';
import type { TypedDocumentString } from '../../api/graphql/generated/graphql';

export type GraphQLMergedQueryConfig = {
  queryFragment: TypedDocumentString<unknown, unknown>;
  responseFragment: TypedDocumentString<unknown, unknown>;
  extras: Array<{
    name: string;
    type: string;
    defaultValue: number | boolean;
  }>;
};

export interface NotificationTypeHandler<TFragment = unknown> {
  readonly type?: SubjectType;

  mergeQueryConfig(): GraphQLMergedQueryConfig;

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
    fetchedData?: TFragment,
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
