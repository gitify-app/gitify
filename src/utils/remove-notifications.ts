import type { AccountNotifications, SettingsState } from '../types';
import type { Notification } from '../typesGitHub';
import { getAccountUUID } from './auth/utils';

export function removeNotifications(
  settings: SettingsState,
  notification: Notification,
  notifications: AccountNotifications[],
): AccountNotifications[] {
  if (settings.delayNotificationState) {
    return notifications;
  }

  const repoSlug = notification.repository.full_name;

  const accountIndex = notifications.findIndex(
    (accountNotifications) =>
      getAccountUUID(accountNotifications.account) ===
      getAccountUUID(notification.account),
  );

  if (accountIndex !== -1) {
    const updatedNotifications = [...notifications];
    updatedNotifications[accountIndex] = {
      ...updatedNotifications[accountIndex],
      notifications: updatedNotifications[accountIndex].notifications.filter(
        (notification) => notification.repository.full_name !== repoSlug,
      ),
    };
    return updatedNotifications;
  }

  return notifications;
}
