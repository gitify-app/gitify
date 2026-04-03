import useFiltersStore from '../../../stores/useFiltersStore';

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

/**
 * Apply base (pre-enrichment) filters to a list of notifications.
 *
 * Filters by subject type, reason, and base search-token qualifiers
 * (org, repo, etc.). Does NOT apply state or author filters, which
 * require enriched data and are handled by `filterDetailedNotifications`.
 *
 * @param notifications - The raw/transformed notifications to filter.
 * @returns The subset of notifications that pass all base filters.
 */
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

/**
 * Apply detailed (post-enrichment) filters to a list of notifications.
 *
 * Only runs when `settings.detailedNotifications` is enabled. Applies
 * user-type and state filters that depend on enriched subject data.
 *
 * @param notifications - The enriched notifications to filter.
 * @param settings - Application settings controlling whether detailed filtering runs.
 * @returns The subset of notifications that pass all detailed filters.
 */
export function filterDetailedNotifications(
  notifications: GitifyNotification[],
  settings: SettingsState,
): GitifyNotification[] {
  return notifications.filter((notification) => {
    let passesFilters = true;

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

/**
 * Return true if a notification with the given state would be filtered out
 * by the current state filter settings.
 *
 * Convenience helper used by UI components to indicate filtered-out states.
 *
 * @param state - The notification state to check.
 * @returns `true` if the state is currently filtered out.
 */
export function isStateFilteredOut(
  state: GitifyNotificationState | undefined,
): boolean {
  const notification = { subject: { state: state } } as GitifyNotification;

  return !passesStateFilter(notification);
}

/**
 * Return true if a notification with the given user would be filtered out
 * by the current user-type filter settings.
 *
 * Convenience helper used by UI components to indicate filtered-out users.
 *
 * @param user - The notification user to check.
 * @returns `true` if the user is currently filtered out.
 */
export function isUserFilteredOut(user: GitifyNotificationUser): boolean {
  const notification = { subject: { user: user } } as GitifyNotification;

  return !passesUserFilters(notification);
}
