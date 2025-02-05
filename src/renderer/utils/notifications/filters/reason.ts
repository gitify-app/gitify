import type { AccountNotifications, SettingsState } from '../../../types';
import type { Notification, Reason } from '../../../typesGitHub';

export function hasReasonFilters(settings: SettingsState) {
  return settings.filterReasons.length > 0;
}

export function isReasonFilterSet(settings: SettingsState, reason: Reason) {
  return settings.filterReasons.includes(reason);
}

export function getReasonFilterCount(
  notifications: AccountNotifications[],
  reason: Reason,
) {
  return notifications.reduce(
    (memo, acc) =>
      memo + acc.notifications.filter((n) => n.reason === reason).length,
    0,
  );
}

export function filterNotificationByReason(
  notification: Notification,
  reason: Reason,
): boolean {
  return notification.reason === reason;
}
