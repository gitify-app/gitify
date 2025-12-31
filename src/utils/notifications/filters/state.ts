import type {
  AccountNotifications,
  FilterStateType,
  GitifyNotification,
  GitifyNotificationState,
  SettingsState,
  TypeDetails,
} from '../../../types';
import type { Filter } from './types';

const STATE_TYPE_DETAILS: Record<FilterStateType, TypeDetails> = {
  draft: {
    title: 'Draft',
  },
  open: {
    title: 'Open',
    description: 'Open or reopened',
  },
  merged: {
    title: 'Merged',
  },
  closed: {
    title: 'Closed',
    description: 'Closed, completed, duplicate, resolved or not planned',
  },
  other: {
    title: 'Other',
    description: 'Catch all for any other notification states',
  },
};

export const stateFilter: Filter<FilterStateType> = {
  FILTER_TYPES: STATE_TYPE_DETAILS,

  requiresDetailsNotifications: true,

  getTypeDetails(stateType: FilterStateType): TypeDetails {
    return this.FILTER_TYPES[stateType];
  },

  hasFilters(settings: SettingsState): boolean {
    return settings.filterStates.length > 0;
  },

  isFilterSet(settings: SettingsState, stateType: FilterStateType): boolean {
    return settings.filterStates.includes(stateType);
  },

  getFilterCount(
    accountNotifications: AccountNotifications[],
    stateType: FilterStateType,
  ): number {
    return accountNotifications.reduce(
      (sum, account) =>
        sum +
        account.notifications.filter((n) =>
          this.filterNotification(n, stateType),
        ).length,
      0,
    );
  },

  filterNotification(
    notification: GitifyNotification,
    stateType: FilterStateType,
  ): boolean {
    const mapped = mapStateToFilter(notification.subject?.state);
    return stateType === mapped;
  },
};

function mapStateToFilter(
  state: GitifyNotificationState | null | undefined,
): FilterStateType {
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
