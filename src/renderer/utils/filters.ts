import type { AccountNotifications, SettingsState } from '../types';
import type { Reason } from '../typesGitHub';

export function hasAnyFiltersSet(settings: SettingsState): boolean {
  return (
    settings.filterReasons.length > 0 ||
    (settings.detailedNotifications && settings.hideBots)
  );
}

export function getNonBotFilterCount(notifications: AccountNotifications[]) {
  return notifications.reduce(
    (memo, acc) =>
      memo +
      acc.notifications.filter((n) => n.subject?.user?.type !== 'Bot').length,
    0,
  );
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
