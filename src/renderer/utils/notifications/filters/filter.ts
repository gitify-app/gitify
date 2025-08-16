import type { SettingsState } from '../../../types';
import type { Notification, StateType } from '../../../typesGitHub';
import {
  filterNotificationByHandle,
  hasExcludeHandleFilters,
  hasIncludeHandleFilters,
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
    subjectTypeFilter.hasFilters(settings) ||
    stateFilter.hasFilters(settings) ||
    reasonFilter.hasFilters(settings)
  );
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
  const notification = { subject: { state } } as Notification;

  return !passesStateFilter(notification, settings);
}
