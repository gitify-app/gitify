import type { SettingsState } from '../../../types';
import type { Notification } from '../../../typesGitHub';

export function hasIncludeHandleFilters(settings: SettingsState) {
  return settings.filterIncludeHandles.length > 0;
}

export function hasExcludeHandleFilters(settings: SettingsState) {
  return settings.filterExcludeHandles.length > 0;
}

export function filterNotificationByHandle(
  notification: Notification,
  handleName: string,
): boolean {
  return notification.subject?.user.login === handleName;
}
