import useFiltersStore from '../../../stores/useFiltersStore';

import type {
  AccountNotifications,
  RawGitifyNotification,
  ReviewRequestTypeFilterValue,
  TypeDetails,
} from '../../../types';
import type { Filter } from './types';

import i18n from '../../../i18n';

export const reviewRequestTypeFilter: Filter<ReviewRequestTypeFilterValue> = {
  get FILTER_TYPES(): Record<ReviewRequestTypeFilterValue, TypeDetails> {
    return {
      direct: {
        title: i18n.t('filters.review_request_type.direct', 'Direct'),
        description: i18n.t(
          'filters.review_request_type.direct_description',
          'You were asked to review directly.',
        ),
      },
      team: {
        title: i18n.t('filters.review_request_type.team', 'Team'),
        description: i18n.t(
          'filters.review_request_type.team_description',
          'A team you belong to was asked to review.',
        ),
      },
      other: {
        title: i18n.t('filters.review_request_type.other', 'Other'),
        description: i18n.t(
          'filters.review_request_type.other_description',
          'Not a review request, such as a mention, comment, or assigned issue.',
        ),
      },
    };
  },

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
