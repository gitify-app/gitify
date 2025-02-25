import type { SettingsState } from '../../../types';
import type { Notification } from '../../../typesGitHub';
import {
  filterNotificationByHandle,
  hasExcludeHandleFilters,
  hasIncludeHandleFilters,
} from './handles';
import { filterNotificationByReason, hasReasonFilters } from './reason';
import { filterNotificationByState, hasStateFilters } from './state';
import { filterNotificationByUserType, hasUserTypeFilters } from './userType';

export function filterNotifications(
  notifications: Notification[],
  settings: SettingsState,
): Notification[] {
  return notifications.filter((notification) => {
    let passesFilters = true;

    if (settings.detailedNotifications) {
      if (hasUserTypeFilters(settings)) {
        passesFilters =
          passesFilters &&
          settings.filterUserTypes.some((userType) =>
            filterNotificationByUserType(notification, userType),
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

      if (hasStateFilters(settings)) {
        return settings.filterStates.some((state) =>
          filterNotificationByState(notification, state),
        );
      }
    }

    if (hasReasonFilters(settings)) {
      passesFilters =
        passesFilters &&
        settings.filterReasons.some((reason) =>
          filterNotificationByReason(notification, reason),
        );
    }

    return passesFilters;
  });
}

export function hasAnyFiltersSet(settings: SettingsState): boolean {
  return (
    hasUserTypeFilters(settings) ||
    hasIncludeHandleFilters(settings) ||
    hasExcludeHandleFilters(settings) ||
    hasStateFilters(settings) ||
    hasReasonFilters(settings)
  );
}
