import type { SettingsState } from '../../types';
import type { Notification } from '../../typesGitHub';

export function filterNotifications(
  notifications: Notification[],
  settings: SettingsState,
): Notification[] {
  return notifications.filter((notification) => {
    if (settings.hideBots && notification.subject?.user?.type === 'Bot') {
      return false;
    }

    if (
      settings.filterReasons.length > 0 &&
      !settings.filterReasons.includes(notification.reason)
    ) {
      return false;
    }

    return true;
  });
}
