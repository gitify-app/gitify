import type { AccountNotifications, RawGitifyNotification, TypeDetails } from '../../../types';

export interface Filter<T extends string> {
  FILTER_TYPES: Record<T, TypeDetails>;

  /**
   * Indicates whether this filter requires detailed notifications to function correctly.
   */
  requiresDetailsNotifications: boolean;

  getTypeDetails(type: T): TypeDetails;

  /**
   * Check if any filters have been set.
   */
  hasFilters(): boolean;

  /**
   * Check if a specific filter is set.
   *
   * @param type filter value to check against
   */
  isFilterSet(type: T): boolean;

  /**
   * Return the count of notifications for a given filter type.
   *
   * @param accountNotifications Notifications
   * @param type Filter type to count
   */
  getFilterCount(accountNotifications: AccountNotifications[], type: T): number;

  /**
   * Perform notification filtering.
   *
   * @param notification Notifications
   * @param type filter value to use
   */
  filterNotification(notification: RawGitifyNotification, type: T): boolean;

  /**
   * Classify a notification into exactly one filter bucket so that the
   * per-option counts of a section partition the inbox. Differs from
   * `filterNotification` in that notifications with missing or overlapping
   * subject data still map to a single canonical bucket (e.g. a pull request
   * requested by both a user and a team counts only under `direct`).
   *
   * @param notification The notification to classify.
   */
  classify(notification: RawGitifyNotification): T;
}
