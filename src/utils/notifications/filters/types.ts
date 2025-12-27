import type {
  AccountNotifications,
  SettingsState,
  TypeDetails,
} from '../../../types';
import type { Notification } from '../../../typesGitHub';

export interface Filter<T extends string> {
  FILTER_TYPES: Record<T, TypeDetails>;

  requiresDetailsNotifications: boolean;

  getTypeDetails(type: T): TypeDetails;

  hasFilters(settings: SettingsState): boolean;

  isFilterSet(settings: SettingsState, type: T): boolean;

  getFilterCount(accountNotifications: AccountNotifications[], type: T): number;

  filterNotification(notification: Notification, type: T): boolean;
}
