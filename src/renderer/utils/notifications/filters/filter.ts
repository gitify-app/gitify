import type { SettingsState } from '../../../types';
import type {
  Notification,
  StateType,
  SubjectUser,
} from '../../../typesGitHub';
import {
  AUTHOR_PREFIX,
  filterNotificationBySearchTerm,
  hasExcludeSearchFilters,
  hasIncludeSearchFilters,
  reasonFilter,
  stateFilter,
  subjectTypeFilter,
  userTypeFilter,
} from '.';

export function filterBaseNotifications(
  notifications: Notification[],
  settings: SettingsState,
): Notification[] {
  return notifications.filter((notification) => {
    let passesFilters = true;

    passesFilters =
      passesFilters && passesActorIncludeExcludeFilters(notification, settings);

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

  // Apply user-specific actor include filters (user: prefix) during detailed filtering
  if (hasIncludeSearchFilters(settings)) {
    const userIncludeTokens = settings.filterIncludeSearchTokens.filter((t) =>
      t.startsWith(AUTHOR_PREFIX),
    );
    if (userIncludeTokens.length > 0) {
      passesFilters =
        passesFilters &&
        userIncludeTokens.some((token) =>
          filterNotificationBySearchTerm(notification, token),
        );
    }
  }

  if (hasExcludeSearchFilters(settings)) {
    const userExcludeTokens = settings.filterExcludeSearchTokens.filter((t) =>
      t.startsWith(AUTHOR_PREFIX),
    );
    if (userExcludeTokens.length > 0) {
      passesFilters =
        passesFilters &&
        !userExcludeTokens.some((token) =>
          filterNotificationBySearchTerm(notification, token),
        );
    }
  }

  return passesFilters;
}

function passesActorIncludeExcludeFilters(
  notification: Notification,
  settings: SettingsState,
): boolean {
  let passesFilters = true;

  if (hasIncludeSearchFilters(settings)) {
    passesFilters =
      passesFilters &&
      settings.filterIncludeSearchTokens.some((token) =>
        filterNotificationBySearchTerm(notification, token),
      );
  }

  if (hasExcludeSearchFilters(settings)) {
    passesFilters =
      passesFilters &&
      !settings.filterExcludeSearchTokens.some((token) =>
        filterNotificationBySearchTerm(notification, token),
      );
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
