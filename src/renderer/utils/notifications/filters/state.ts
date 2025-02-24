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
} as Partial<Record<FilterStateType, TypeDetails>> as Record<
  FilterStateType,
  TypeDetails
>;

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
  if (stateType === 'open') {
    return ['open', 'reopened'].includes(notification.subject?.state);
  }

  if (stateType === 'closed') {
    return ['closed', 'completed', 'not_planned'].includes(
      notification.subject?.state,
    );
  }

  if (stateType === 'merged' || stateType === 'draft') {
    return notification.subject?.state === stateType;
  }

  return ![
    'open',
    'reopened',
    'closed',
    'completed',
    'not_planned',
    'merged',
    'draft',
  ].includes(notification.subject?.state);
}
