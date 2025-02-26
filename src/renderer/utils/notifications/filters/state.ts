import type {
  AccountNotifications,
  FilterStateType,
  SettingsState,
  TypeDetails,
} from '../../../types';
import type { Notification } from '../../../typesGitHub';

export const FILTERS_STATE_TYPES: Record<FilterStateType, TypeDetails> = {
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

export function getStateDetails(stateType: FilterStateType): TypeDetails {
  return FILTERS_STATE_TYPES[stateType];
}

export function hasStateFilters(settings: SettingsState) {
  return settings.filterStates.length > 0;
}

export function isStateFilterSet(
  settings: SettingsState,
  stateType: FilterStateType,
) {
  return settings.filterStates.includes(stateType);
}

export function getStateFilterCount(
  notifications: AccountNotifications[],
  stateType: FilterStateType,
) {
  return notifications.reduce(
    (sum, account) =>
      sum +
      account.notifications.filter((n) =>
        filterNotificationByState(n, stateType),
      ).length,
    0,
  );
}

export function filterNotificationByState(
  notification: Notification,
  stateType: FilterStateType,
): boolean {
  const allOpenStates = ['open', 'reopened'];
  const allClosedStates = ['closed', 'completed', 'not_planned'];
  const allMergedStates = ['merged'];
  const allDraftStates = ['draft'];
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
}
