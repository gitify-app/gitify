import useFiltersStore from '../../../stores/useFiltersStore';

import type {
  AccountNotifications,
  RawGitifyNotification,
  ReasonFilterValue,
  TypeDetails,
} from '../../../types';
import type { Filter } from './types';

import i18n from '../../../i18n';
import { getReasonTypeDetails } from '../reason';

export const reasonFilter: Filter<ReasonFilterValue> = {
  get FILTER_TYPES(): Record<ReasonFilterValue, TypeDetails> {
    return {
      ...getReasonTypeDetails(),
      other: {
        title: i18n.t('filters.reason.other', 'Other'),
        description: i18n.t(
          'filters.reason.other_description',
          'Notifications with a reason that is not listed above.',
        ),
      },
    };
  },

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
      return !(notification.reason.code in getReasonTypeDetails());
    }
    return notification.reason.code === reason;
  },

  classify(notification: RawGitifyNotification): ReasonFilterValue {
    const code = notification.reason.code;
    return code in getReasonTypeDetails() ? code : 'other';
  },
};
