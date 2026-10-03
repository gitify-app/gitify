import { useFiltersStore } from '../../../stores';

import type {
  AccountNotifications,
  RawGitifyNotification,
  TypeDetails,
  UserType,
  UserTypeFilterValue,
} from '../../../types';
import type { Filter } from './types';

const USER_TYPE_DETAILS: Record<UserTypeFilterValue, TypeDetails> = {
  User: {
    title: 'User',
  },
  Bot: {
    title: 'Bot',
    description: 'Bot accounts such as @copilot, @dependabot, @renovate, @netlify, etc',
  },
  Organization: {
    title: 'Organization',
  },
  other: {
    title: 'Other',
    description:
      'Notifications with no author, or an author that is not a User, Bot, or Organization.',
  },
};

// Author types that map to the "User" filter option.
const USER_MATCHING_TYPES: readonly string[] = ['User', 'EnterpriseUserAccount'] as const;

// Author types that are covered by the enumerated options (User/Bot/Organization).
const ENUMERATED_USER_TYPES: readonly string[] = [
  ...USER_MATCHING_TYPES,
  'Bot',
  'Organization',
] as const;

export const userTypeFilter: Filter<UserTypeFilterValue> = {
  FILTER_TYPES: USER_TYPE_DETAILS,

  requiresDetailsNotifications: true,

  getTypeDetails(userType: UserTypeFilterValue): TypeDetails {
    return this.FILTER_TYPES[userType];
  },

  hasFilters(): boolean {
    const filters = useFiltersStore.getState();
    return filters.userTypes.length > 0;
  },

  isFilterSet(userType: UserTypeFilterValue): boolean {
    const filters = useFiltersStore.getState();
    return filters.userTypes.includes(userType);
  },

  getFilterCount(
    accountNotifications: AccountNotifications[],
    userType: UserTypeFilterValue,
  ): number {
    return accountNotifications.reduce(
      (sum, account) =>
        sum + account.notifications.filter((n) => this.classify(n) === userType).length,
      0,
    );
  },

  filterNotification(notification: RawGitifyNotification, userType: UserTypeFilterValue): boolean {
    // Match on the thread author so e.g. "Bot" means "authored by a bot"
    // (dependabot, renovate) rather than "a bot left the latest comment".
    if (userType === 'other') {
      const authorType = notification.subject?.author?.type;
      return !authorType || !ENUMERATED_USER_TYPES.includes(authorType);
    }

    if (userType === 'User') {
      return USER_MATCHING_TYPES.includes(notification.subject?.author?.type ?? '');
    }

    return notification.subject?.author?.type === userType;
  },

  classify(notification: RawGitifyNotification): UserTypeFilterValue {
    const authorType = notification.subject?.author?.type;

    if (authorType === 'Bot') {
      return 'Bot';
    }
    if (authorType === 'Organization') {
      return 'Organization';
    }
    if (authorType === 'User' || authorType === 'EnterpriseUserAccount') {
      return 'User';
    }
    return 'other';
  },
};

// Keep this function directly exported as it's not part of the interface
export function isNonHumanUser(type: UserType): boolean {
  return type === 'Bot' || type === 'Organization' || type === 'Mannequin';
}
