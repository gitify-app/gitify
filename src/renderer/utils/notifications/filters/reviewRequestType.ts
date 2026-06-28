import { useFiltersStore } from '../../../stores';

import type {
  AccountNotifications,
  RawGitifyNotification,
  ReviewRequestType,
  TypeDetails,
} from '../../../types';
import type { Filter } from './types';

const REVIEW_REQUEST_TYPE_DETAILS: Record<ReviewRequestType, TypeDetails> = {
  direct: {
    title: 'Direct',
    description: 'You were directly requested as a reviewer.',
  },
  team: {
    title: 'Team',
    description: 'A team you are a member of was requested to review.',
  },
};

export const reviewRequestTypeFilter: Filter<ReviewRequestType> = {
  FILTER_TYPES: REVIEW_REQUEST_TYPE_DETAILS,

  requiresDetailsNotifications: true,

  getTypeDetails(type: ReviewRequestType): TypeDetails {
    return this.FILTER_TYPES[type];
  },

  hasFilters(): boolean {
    const filters = useFiltersStore.getState();
    return filters.reviewRequestTypes.length > 0;
  },

  isFilterSet(type: ReviewRequestType): boolean {
    const filters = useFiltersStore.getState();
    return filters.reviewRequestTypes.includes(type);
  },

  getFilterCount(accountNotifications: AccountNotifications[], type: ReviewRequestType): number {
    return accountNotifications.reduce(
      (sum, account) =>
        sum + account.notifications.filter((n) => this.filterNotification(n, type)).length,
      0,
    );
  },

  filterNotification(notification: RawGitifyNotification, type: ReviewRequestType): boolean {
    return notification.subject?.reviewRequested?.includes(type) ?? false;
  },
};
