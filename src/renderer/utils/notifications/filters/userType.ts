import type {
  AccountNotifications,
  SettingsState,
  TypeDetails,
} from '../../../types';
import type { Notification, UserType } from '../../../typesGitHub';

export const FILTERS_USER_TYPES: Record<UserType, TypeDetails> = {
  User: {
    title: 'User',
  },
  Bot: {
    title: 'Bot',
    description: 'Bot accounts such as @dependabot, @renovate, @netlify, etc',
  },
  Organization: {
    title: 'Organization',
  },
} as Partial<Record<UserType, TypeDetails>> as Record<UserType, TypeDetails>;

export function getUserTypeDetails(userType: UserType): TypeDetails {
  return FILTERS_USER_TYPES[userType];
}

export function hasUserTypeFilters(settings: SettingsState) {
  return settings.filterUserTypes.length > 0;
}

export function isUserTypeFilterSet(
  settings: SettingsState,
  userType: UserType,
) {
  return settings.filterUserTypes.includes(userType);
}

export function getUserTypeFilterCount(
  notifications: AccountNotifications[],
  userType: UserType,
) {
  return notifications.reduce(
    (memo, acc) =>
      memo +
      acc.notifications.filter((n) => filterNotificationByUserType(n, userType))
        .length,
    0,
  );
}

export function filterNotificationByUserType(
  notification: Notification,
  userType: UserType,
): boolean {
  if (userType === 'User') {
    return (
      notification.subject?.user?.type === 'User' ||
      notification.subject?.user?.type === 'EnterpriseUserAccount'
    );
  }

  return notification.subject?.user?.type === userType;
}
