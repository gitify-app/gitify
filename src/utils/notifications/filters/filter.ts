import type {
  GitifyNotification,
  GitifyNotificationState,
  GitifyNotificationUser,
  SettingsState,
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
  settings: SettingsState,
): GitifyNotification[] {
  return notifications.filter((notification) => {
    let passesFilters = true;

    // Apply base qualifier include/exclude filters (org, repo, etc.)
    for (const qualifier of BASE_SEARCH_QUALIFIERS) {
      if (!passesFilters) {
        break;
      }

      passesFilters =
        passesFilters &&
        passesSearchTokenFiltersForQualifier(notification, settings, qualifier);
    }

    if (subjectTypeFilter.hasFilters(settings)) {
      passesFilters =
        passesFilters &&
        settings.filterSubjectTypes.some((subjectType) =>
          subjectTypeFilter.filterNotification(notification, subjectType),
        );
    }

    if (reasonFilter.hasFilters(settings)) {
      passesFilters =
        passesFilters &&
        settings.filterReasons.some((reason) =>
          reasonFilter.filterNotification(notification, reason),
        );
    }

    return passesFilters;
  });
}

export function filterDetailedNotifications(
  notifications: GitifyNotification[],
  settings: SettingsState,
): GitifyNotification[] {
  return notifications.filter((notification) => {
    let passesFilters = true;

    if (settings.detailedNotifications) {
      passesFilters =
        passesFilters && passesUserFilters(notification, settings);

      passesFilters =
        passesFilters && passesStateFilter(notification, settings);
    }

    return passesFilters;
  });
}

export function hasActiveFilters(settings: SettingsState): boolean {
  return (
    userTypeFilter.hasFilters(settings) ||
    hasIncludeSearchFilters(settings) ||
    hasExcludeSearchFilters(settings) ||
    subjectTypeFilter.hasFilters(settings) ||
    stateFilter.hasFilters(settings) ||
    reasonFilter.hasFilters(settings)
  );
}

/**
 * Apply include/exclude search token logic for a specific search qualifier prefix.
 */
function passesSearchTokenFiltersForQualifier(
  notification: GitifyNotification,
  settings: SettingsState,
  qualifier: SearchQualifier,
): boolean {
  let passes = true;
  const prefix = qualifier.prefix;

  if (hasIncludeSearchFilters(settings)) {
    const includeTokens = settings.filterIncludeSearchTokens.filter((t) =>
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

  if (hasExcludeSearchFilters(settings)) {
    const excludeTokens = settings.filterExcludeSearchTokens.filter((t) =>
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

function passesUserFilters(
  notification: GitifyNotification,
  settings: SettingsState,
): boolean {
  let passesFilters = true;

  if (userTypeFilter.hasFilters(settings)) {
    passesFilters =
      passesFilters &&
      settings.filterUserTypes.some((userType) =>
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
      passesSearchTokenFiltersForQualifier(notification, settings, qualifier);
  }

  return passesFilters;
}

function passesStateFilter(
  notification: GitifyNotification,
  settings: SettingsState,
): boolean {
  if (stateFilter.hasFilters(settings)) {
    return settings.filterStates.some((state) =>
      stateFilter.filterNotification(notification, state),
    );
  }

  return true;
}

export function isStateFilteredOut(
  state: GitifyNotificationState | undefined,
  settings: SettingsState,
): boolean {
  const notification = { subject: { state: state } } as GitifyNotification;

  return !passesStateFilter(notification, settings);
}

export function isUserFilteredOut(
  user: GitifyNotificationUser,
  settings: SettingsState,
): boolean {
  const notification = { subject: { user: user } } as GitifyNotification;

  return !passesUserFilters(notification, settings);
}
