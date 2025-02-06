import type { SettingsState } from '../../../types';
import type { Notification } from '../../../typesGitHub';
import {
  filterNotificationByHandle,
  hasExcludeHandleFilters,
  hasIncludeHandleFilters,
} from './handles';
import { filterNotificationByReason, hasReasonFilters } from './reason';
import { filterNotificationByUserType, hasUserTypeFilters } from './userType';

export function filterNotifications(
  notifications: Notification[],
  settings: SettingsState,
): Notification[] {
  return notifications.filter((notification) => {
    if (settings.detailedNotifications) {
      if (hasUserTypeFilters(settings)) {
        return settings.filterUserTypes.some((userType) =>
          filterNotificationByUserType(notification, userType),
        );
      }

      if (hasIncludeHandleFilters(settings)) {
        return settings.filterIncludeHandles.some((handle) =>
          filterNotificationByHandle(notification, handle),
        );
      }

      if (hasExcludeHandleFilters(settings)) {
        return !settings.filterExcludeHandles.some((handle) =>
          filterNotificationByHandle(notification, handle),
        );
      }
    }

    if (hasReasonFilters(settings)) {
      return settings.filterReasons.some((reason) =>
        filterNotificationByReason(notification, reason),
      );
    }

    return true;
  });
}

export function hasAnyFiltersSet(settings: SettingsState): boolean {
  return (
    hasUserTypeFilters(settings) ||
    hasIncludeHandleFilters(settings) ||
    hasExcludeHandleFilters(settings) ||
    hasReasonFilters(settings)
  );
}
