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
    (sum, account) =>
      sum +
      account.notifications.filter((n) =>
        filterNotificationByUserType(n, userType),
      ).length,
    0,
  );
}

export function filterNotificationByUserType(
  notification: Notification,
  userType: UserType,
): boolean {
  const allUserTypes = ['User', 'EnterpriseUserAccount'];

  if (userType === 'User') {
    return allUserTypes.includes(notification.subject?.user?.type);
  }

  return notification.subject?.user?.type === userType;
}

export function isNonHumanUser(type: UserType): boolean {
  return type === 'Bot' || type === 'Organization' || type === 'Mannequin';
}
