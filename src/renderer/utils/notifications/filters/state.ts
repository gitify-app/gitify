import type {
  AccountNotifications,
  FilterStateType,
  GitifyNotificationState,
  SettingsState,
  TypeDetails,
} from '../../../types';
import type { Notification } from '../../../typesGitHub';
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
    description: 'Closed, completed or not planned',
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
    notification: Notification,
    stateType: FilterStateType,
  ): boolean {
    const allOpenStates: GitifyNotificationState[] = ['OPEN', 'REOPENED'];
    const allClosedStates: GitifyNotificationState[] = [
      'CLOSED',
      'COMPLETED',
      'NOT_PLANNED',
    ];
    const allMergedStates: GitifyNotificationState[] = ['MERGED'];
    const allDraftStates: GitifyNotificationState[] = ['DRAFT'];
    const allFilterableStates = [
      ...allOpenStates,
      ...allClosedStates,
      ...allMergedStates,
      ...allDraftStates,
    ];

    switch (stateType) {
      case 'open':
        return allOpenStates.includes(notification.subject?.state);
      case 'closed':
        return allClosedStates.includes(notification.subject?.state);
      case 'merged':
        return allMergedStates.includes(notification.subject?.state);
      case 'draft':
        return allDraftStates.includes(notification.subject?.state);
      default:
        return !allFilterableStates.includes(notification.subject?.state);
    }
  },
};
