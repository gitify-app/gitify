import type {
  AccountNotifications,
  SettingsState,
  TypeDetails,
} from '../../../types';
import type { Notification, UserType } from '../../../typesGitHub';
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

  filterNotification(notification: Notification, userType: UserType): boolean {
    const allUserTypes = ['User', 'EnterpriseUserAccount'];

    if (userType === 'User') {
      return allUserTypes.includes(notification.subject?.user?.type);
    }

    return notification.subject?.user?.type === userType;
  },
};

// Keep this function directly exported as it's not part of the interface
export function isNonHumanUser(type: UserType): boolean {
  return type === 'Bot' || type === 'Organization' || type === 'Mannequin';
}
