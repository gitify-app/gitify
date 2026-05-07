import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';

import type {
  GitifySubject,
  IconColor,
  Link,
  RawGitifyNotification,
  SettingsState,
  UserType,
} from '../../../../types';

export interface NotificationTypeHandler {
  /**
   * Whether the notification handler supports enrichment via merged GraphQL query.
   */
  readonly supportsMergedQueryEnrichment: boolean;

  /**
   * Enriches a base notification with additional information (state, author, metrics, etc).
   *
   * @param notification The base notification being enriched
   * @param settings The app settings, which for some handlers may not be used during enrichment.
   * @param fetchedData Previously fetched enrichment data (upstream).  If present, then enrich will skip fetching detailed data inline.
   */
  enrich(
    notification: RawGitifyNotification,
    settings: SettingsState,
    fetchedData?: unknown,
  ): Promise<Partial<GitifySubject>>;

  /**
   * Return the icon component for this notification type.
   */
  iconType(notification: RawGitifyNotification): FC<OcticonProps>;

  /**
   * Return the icon color for this notification type.
   */
  iconColor(notification: RawGitifyNotification): IconColor;

  /**
   * Default url for notification type.
   */
  defaultUrl(notification: RawGitifyNotification): Link;

  /**
   * Default user type for notification type.
   */
  defaultUserType(): UserType;
}
