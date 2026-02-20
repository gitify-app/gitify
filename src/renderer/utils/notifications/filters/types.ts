import type {
  AccountNotifications,
  GitifyNotification,
  TypeDetails,
} from '../../../types';

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
  filterNotification(notification: GitifyNotification, type: T): boolean;
}
