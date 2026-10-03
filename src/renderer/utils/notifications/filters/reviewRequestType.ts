import { useFiltersStore } from '../../../stores';

import type {
  AccountNotifications,
  RawGitifyNotification,
  ReviewRequestTypeFilterValue,
  TypeDetails,
} from '../../../types';
import type { Filter } from './types';

const REVIEW_REQUEST_TYPE_DETAILS: Record<ReviewRequestTypeFilterValue, TypeDetails> = {
  direct: {
    title: 'Direct',
    description: 'You were directly requested as a reviewer.',
  },
  team: {
    title: 'Team',
    description: 'A team you are a member of was requested to review.',
  },
  other: {
    title: 'Other',
    description:
      'Notifications that are not a review request, e.g. mentions, comments, assigned issues.',
  },
};

export const reviewRequestTypeFilter: Filter<ReviewRequestTypeFilterValue> = {
  FILTER_TYPES: REVIEW_REQUEST_TYPE_DETAILS,

  requiresDetailsNotifications: true,

  getTypeDetails(type: ReviewRequestTypeFilterValue): TypeDetails {
    return this.FILTER_TYPES[type];
  },

  hasFilters(): boolean {
    const filters = useFiltersStore.getState();
    return filters.reviewRequestTypes.length > 0;
  },

  isFilterSet(type: ReviewRequestTypeFilterValue): boolean {
    const filters = useFiltersStore.getState();
    return filters.reviewRequestTypes.includes(type);
  },

  getFilterCount(
    accountNotifications: AccountNotifications[],
    type: ReviewRequestTypeFilterValue,
  ): number {
    return accountNotifications.reduce(
      (sum, account) => sum + account.notifications.filter((n) => this.classify(n) === type).length,
      0,
    );
  },

  filterNotification(
    notification: RawGitifyNotification,
    type: ReviewRequestTypeFilterValue,
  ): boolean {
    if (type === 'other') {
      const reviewRequested = notification.subject?.reviewRequested;
      return !reviewRequested || reviewRequested.length === 0;
    }
    return notification.subject?.reviewRequested?.includes(type) ?? false;
  },

  classify(notification: RawGitifyNotification): ReviewRequestTypeFilterValue {
    const reviewRequested = notification.subject?.reviewRequested;
    if (reviewRequested?.includes('direct')) {
      return 'direct';
    }
    if (reviewRequested?.includes('team')) {
      return 'team';
    }
    return 'other';
  },
};
