import { useSettingsStore } from '../../../stores';
import useFiltersStore from '../../../stores/useFiltersStore';

import type {
  GitifyNotification,
  GitifyNotificationState,
  GitifyNotificationUser,
} from '../../../types';

import {
  BASE_SEARCH_QUALIFIERS,
  DETAILED_ONLY_SEARCH_QUALIFIERS,
  filterNotificationBySearchTerm,
  hasExcludeSearchFilters,
  hasIncludeSearchFilters,
  reasonFilter,
  type SearchQualifier,
  stateFilter,
  subjectTypeFilter,
  userTypeFilter,
} from '.';

export function filterBaseNotifications(
  notifications: GitifyNotification[],
): GitifyNotification[] {
  return notifications.filter((notification) => {
    const filters = useFiltersStore.getState();

    let passesFilters = true;

    // Apply base qualifier include/exclude filters (org, repo, etc.)
    for (const qualifier of BASE_SEARCH_QUALIFIERS) {
      if (!passesFilters) {
        break;
      }

      passesFilters =
        passesFilters &&
        passesSearchTokenFiltersForQualifier(notification, qualifier);
    }

    if (subjectTypeFilter.hasFilters()) {
      passesFilters =
        passesFilters &&
        filters.subjectTypes.some((subjectType) =>
          subjectTypeFilter.filterNotification(notification, subjectType),
        );
    }

    if (reasonFilter.hasFilters()) {
      passesFilters =
        passesFilters &&
        filters.reasons.some((reason) =>
          reasonFilter.filterNotification(notification, reason),
        );
    }

    return passesFilters;
  });
}

export function filterDetailedNotifications(
  notifications: GitifyNotification[],
): GitifyNotification[] {
  return notifications.filter((notification) => {
    let passesFilters = true;
    const settings = useSettingsStore.getState();

    if (settings.detailedNotifications) {
      passesFilters = passesFilters && passesUserFilters(notification);

      passesFilters = passesFilters && passesStateFilter(notification);
    }

    return passesFilters;
  });
}

/**
 * Apply include/exclude search token logic for a specific search qualifier prefix.
 */
function passesSearchTokenFiltersForQualifier(
  notification: GitifyNotification,
  qualifier: SearchQualifier,
): boolean {
  const filters = useFiltersStore.getState();

  let passes = true;
  const prefix = qualifier.prefix;

  if (hasIncludeSearchFilters()) {
    const includeTokens = filters.includeSearchTokens.filter((t) =>
      t.startsWith(prefix),
    );
    if (includeTokens.length > 0) {
      passes =
        passes &&
        includeTokens.some((token) =>
          filterNotificationBySearchTerm(notification, token),
        );
    }
  }

  if (hasExcludeSearchFilters()) {
    const excludeTokens = filters.excludeSearchTokens.filter((t) =>
      t.startsWith(prefix),
    );
    if (excludeTokens.length > 0) {
      passes =
        passes &&
        !excludeTokens.some((token) =>
          filterNotificationBySearchTerm(notification, token),
        );
    }
  }

  return passes;
}

function passesUserFilters(notification: GitifyNotification): boolean {
  const filters = useFiltersStore.getState();

  let passesFilters = true;

  if (userTypeFilter.hasFilters()) {
    passesFilters =
      passesFilters &&
      filters.userTypes.some((userType) =>
        userTypeFilter.filterNotification(notification, userType),
      );
  }

  // Apply detailed-only qualifier search token filters (e.g. author)
  for (const qualifier of DETAILED_ONLY_SEARCH_QUALIFIERS) {
    if (!passesFilters) {
      break;
    }

    passesFilters =
      passesFilters &&
      passesSearchTokenFiltersForQualifier(notification, qualifier);
  }

  return passesFilters;
}

function passesStateFilter(notification: GitifyNotification): boolean {
  const filters = useFiltersStore.getState();

  if (stateFilter.hasFilters()) {
    return filters.states.some((state) =>
      stateFilter.filterNotification(notification, state),
    );
  }

  return true;
}

export function isStateFilteredOut(state: GitifyNotificationState): boolean {
  const notification = { subject: { state: state } } as GitifyNotification;

  return !passesStateFilter(notification);
}

export function isUserFilteredOut(user: GitifyNotificationUser): boolean {
  const notification = { subject: { user: user } } as GitifyNotification;

  return !passesUserFilters(notification);
}
