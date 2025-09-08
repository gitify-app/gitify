import type { SettingsState } from '../../../types';
import type {
  Notification,
  StateType,
  SubjectUser,
} from '../../../typesGitHub';
import {
  filterNotificationBySearchTerm,
  hasExcludeSearchFilters,
  hasIncludeSearchFilters,
  reasonFilter,
  stateFilter,
  subjectTypeFilter,
  userTypeFilter,
  type SearchQualifier,
  BASE_QUALIFIERS,
  DETAILED_ONLY_QUALIFIERS,
} from '.';



export function filterBaseNotifications(
  notifications: Notification[],
  settings: SettingsState,
): Notification[] {
  return notifications.filter((notification) => {
    let passesFilters = true;

    // Apply base qualifier include/exclude filters (org, repo, etc.)
    for (const qualifier of BASE_QUALIFIERS) {
      if (!passesFilters) break;
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
  notifications: Notification[],
  settings: SettingsState,
): Notification[] {
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

export function hasAnyFiltersSet(settings: SettingsState): boolean {
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
  notification: Notification,
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
  notification: Notification,
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
  for (const qualifier of DETAILED_ONLY_QUALIFIERS) {
    if (!passesFilters) break;
    passesFilters =
      passesFilters &&
      passesSearchTokenFiltersForQualifier(notification, settings, qualifier);
  }

  return passesFilters;
}

function passesStateFilter(
  notification: Notification,
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
  state: StateType,
  settings: SettingsState,
): boolean {
  const notification = { subject: { state: state } } as Notification;

  return !passesStateFilter(notification, settings);
}

export function isUserFilteredOut(
  user: SubjectUser,
  settings: SettingsState,
): boolean {
  const notification = { subject: { user: user } } as Notification;

  return !passesUserFilters(notification, settings);
}
