import type {
  AccountNotifications,
  GitifyNotification,
  SettingsState,
  TypeDetails,
} from '../../../types';

export interface Filter<T extends string> {
  FILTER_TYPES: Record<T, TypeDetails>;

  requiresDetailsNotifications: boolean;

  getTypeDetails(type: T): TypeDetails;

  hasFilters(settings: SettingsState): boolean;

  isFilterSet(settings: SettingsState, type: T): boolean;

  getFilterCount(accountNotifications: AccountNotifications[], type: T): number;

  filterNotification(notification: GitifyNotification, type: T): boolean;
}
