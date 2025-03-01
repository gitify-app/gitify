import type {
  AccountNotifications,
  SettingsState,
  TypeDetails,
} from '../../../types';
import type { Notification, Reason } from '../../../typesGitHub';
import { REASON_TYPE_DETAILS } from '../../reason';
import type { Filter } from './types';

export const reasonFilter: Filter<Reason> = {
  FILTER_TYPES: REASON_TYPE_DETAILS,

  requiresDetailsNotifications: false,

  getTypeDetails(reason: Reason): TypeDetails {
    return this.FILTER_TYPES[reason];
  },

  hasFilters(settings: SettingsState): boolean {
    return settings.filterReasons.length > 0;
  },

  isFilterSet(settings: SettingsState, reason: Reason): boolean {
    return settings.filterReasons.includes(reason);
  },

  getFilterCount(
    notifications: AccountNotifications[],
    reason: Reason,
  ): number {
    return notifications.reduce(
      (sum, account) =>
        sum +
        account.notifications.filter((n) => this.filterNotification(n, reason))
          .length,
      0,
    );
  },

  filterNotification(notification: Notification, reason: Reason): boolean {
    return notification.reason === reason;
  },
};
