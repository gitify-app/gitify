import useFiltersStore from '../../../stores/useFiltersStore';

import type {
  AccountNotifications,
  FilterStateType,
  GitifyNotificationState,
  RawGitifyNotification,
  TypeDetails,
} from '../../../types';
import type { Filter } from './types';

import i18n from '../../../i18n';

export const stateFilter: Filter<FilterStateType> = {
  get FILTER_TYPES(): Record<FilterStateType, TypeDetails> {
    return {
      draft: {
        title: i18n.t('filters.state.draft', 'Draft'),
      },
      open: {
        title: i18n.t('filters.state.open', 'Open'),
        description: i18n.t('filters.state.open_description', 'Open or reopened.'),
      },
      merged: {
        title: i18n.t('filters.state.merged', 'Merged'),
      },
      closed: {
        title: i18n.t('filters.state.closed', 'Closed'),
        description: i18n.t(
          'filters.state.closed_description',
          'Closed, completed, duplicate, resolved, or not planned.',
        ),
      },
      other: {
        title: i18n.t('filters.state.other', 'Other'),
        description: i18n.t('filters.state.other_description', 'Any other notification state.'),
      },
    };
  },

  requiresDetailsNotifications: true,

  getTypeDetails(stateType: FilterStateType): TypeDetails {
    return this.FILTER_TYPES[stateType];
  },

  hasFilters(): boolean {
    const filters = useFiltersStore.getState();
    return filters.states.length > 0;
  },

  isFilterSet(stateType: FilterStateType): boolean {
    const filters = useFiltersStore.getState();
    return filters.states.includes(stateType);
  },

  getFilterCount(accountNotifications: AccountNotifications[], stateType: FilterStateType): number {
    return accountNotifications.reduce(
      (sum, account) =>
        sum + account.notifications.filter((n) => this.classify(n) === stateType).length,
      0,
    );
  },

  filterNotification(notification: RawGitifyNotification, stateType: FilterStateType): boolean {
    const mapped = mapStateToFilter(notification.subject?.state);
    return stateType === mapped;
  },

  classify(notification: RawGitifyNotification): FilterStateType {
    return mapStateToFilter(notification.subject?.state);
  },
};

function mapStateToFilter(state: GitifyNotificationState | null | undefined): FilterStateType {
  switch (state) {
    case 'OPEN':
    case 'REOPENED':
      return 'open';
    case 'CLOSED':
    case 'COMPLETED':
    case 'DUPLICATE':
    case 'NOT_PLANNED':
    case 'RESOLVED':
      return 'closed';
    case 'MERGE_QUEUE':
    case 'MERGED':
      return 'merged';
    case 'DRAFT':
      return 'draft';
    default:
      return 'other';
  }
}
