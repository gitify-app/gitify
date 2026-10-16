import { useFiltersStore } from '../../../stores';

import type {
  AccountNotifications,
  RawGitifyNotification,
  ReasonFilterValue,
  TypeDetails,
} from '../../../types';
import type { Filter } from './types';

import { REASON_TYPE_DETAILS } from '../reason';

const REASON_FILTER_TYPE_DETAILS: Record<ReasonFilterValue, TypeDetails> = {
  ...REASON_TYPE_DETAILS,
  other: {
    title: 'Other',
    description: 'Notifications with a reason that is not listed above.',
  },
};

export const reasonFilter: Filter<ReasonFilterValue> = {
  FILTER_TYPES: REASON_FILTER_TYPE_DETAILS,

  requiresDetailsNotifications: false,

  getTypeDetails(reason: ReasonFilterValue): TypeDetails {
    return this.FILTER_TYPES[reason];
  },

  hasFilters(): boolean {
    const filters = useFiltersStore.getState();
    return filters.reasons.length > 0;
  },

  isFilterSet(reason: ReasonFilterValue): boolean {
    const filters = useFiltersStore.getState();
    return filters.reasons.includes(reason);
  },

  getFilterCount(accountNotifications: AccountNotifications[], reason: ReasonFilterValue): number {
    return accountNotifications.reduce(
      (sum, account) =>
        sum + account.notifications.filter((n) => this.classify(n) === reason).length,
      0,
    );
  },

  filterNotification(notification: RawGitifyNotification, reason: ReasonFilterValue): boolean {
    if (reason === 'other') {
      return !(notification.reason.code in REASON_TYPE_DETAILS);
    }
    return notification.reason.code === reason;
  },

  classify(notification: RawGitifyNotification): ReasonFilterValue {
    const code = notification.reason.code;
    return code in REASON_TYPE_DETAILS ? code : 'other';
  },
};
