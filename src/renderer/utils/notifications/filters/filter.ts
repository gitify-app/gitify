import type { SettingsState } from '../../../types';
import type {
  Notification,
  StateType,
  SubjectUser,
} from '../../../typesGitHub';
import {
  filterNotificationByHandle,
  filterNotificationByOrganization,
  hasExcludeHandleFilters,
  hasExcludeOrganizationFilters,
  hasIncludeHandleFilters,
  hasIncludeOrganizationFilters,
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
      passesFilters && passesOrganizationFilters(notification, settings);

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
    hasIncludeHandleFilters(settings) ||
    hasExcludeHandleFilters(settings) ||
    hasIncludeOrganizationFilters(settings) ||
    hasExcludeOrganizationFilters(settings) ||
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

  if (hasIncludeHandleFilters(settings)) {
    passesFilters =
      passesFilters &&
      settings.filterIncludeHandles.some((handle) =>
        filterNotificationByHandle(notification, handle),
      );
  }

  if (hasExcludeHandleFilters(settings)) {
    passesFilters =
      passesFilters &&
      !settings.filterExcludeHandles.some((handle) =>
        filterNotificationByHandle(notification, handle),
      );
  }

  return passesFilters;
}

function passesOrganizationFilters(
  notification: Notification,
  settings: SettingsState,
): boolean {
  let passesFilters = true;

  if (hasIncludeOrganizationFilters(settings)) {
    passesFilters =
      passesFilters &&
      settings.filterIncludeOrganizations.some((organization) =>
        filterNotificationByOrganization(notification, organization),
      );
  }

  if (hasExcludeOrganizationFilters(settings)) {
    passesFilters =
      passesFilters &&
      !settings.filterExcludeOrganizations.some((organization) =>
        filterNotificationByOrganization(notification, organization),
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
