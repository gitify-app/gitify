import type { SettingsState } from '../../../types';
import type { Notification } from '../../../typesGitHub';
import {
  filterNotificationByHandle,
  hasExcludeHandleFilters,
  hasIncludeHandleFilters,
  reasonFilter,
  stateFilter,
  subjectTypeFilter,
  userTypeFilter,
} from '.';

export function filterNotifications(
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

      if (stateFilter.hasFilters(settings)) {
        passesFilters =
          passesFilters &&
          settings.filterStates.some((state) =>
            stateFilter.filterNotification(notification, state),
          );
      }
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
