import type {
  AccountNotifications,
  GitifyNotification,
  SettingsState,
  TypeDetails,
  UserType,
} from '../../../types';
import type { Filter } from './types';

const USER_TYPE_DETAILS: Record<UserType, TypeDetails> = {
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

export const userTypeFilter: Filter<UserType> = {
  FILTER_TYPES: USER_TYPE_DETAILS,

  requiresDetailsNotifications: true,

  getTypeDetails(userType: UserType): TypeDetails {
    return this.FILTER_TYPES[userType];
  },

  hasFilters(settings: SettingsState): boolean {
    return settings.filterUserTypes.length > 0;
  },

  isFilterSet(settings: SettingsState, userType: UserType): boolean {
    return settings.filterUserTypes.includes(userType);
  },

  getFilterCount(
    accountNotifications: AccountNotifications[],
    userType: UserType,
  ): number {
    return accountNotifications.reduce(
      (sum, account) =>
        sum +
        account.notifications.filter((n) =>
          this.filterNotification(n, userType),
        ).length,
      0,
    );
  },

  filterNotification(
    notification: GitifyNotification,
    userType: UserType,
  ): boolean {
    const allUserTypes = ['User', 'EnterpriseUserAccount'];
    const notificationUserType = notification.subject?.user?.type;

    if (!notificationUserType) {
      return false;
    }

    if (userType === 'User') {
      return allUserTypes.includes(notificationUserType);
    }

    return notificationUserType === userType;
  },
};

// Keep this function directly exported as it's not part of the interface
export function isNonHumanUser(type: UserType): boolean {
  return type === 'Bot' || type === 'Organization' || type === 'Mannequin';
}
