import type { AccountNotifications, SettingsState } from '../types';
import type { Notification } from '../typesGitHub';
import { getAccountUUID } from './auth/utils';

export function removeNotification(
  settings: SettingsState,
  notification: Notification,
  notifications: AccountNotifications[],
): AccountNotifications[] {
  if (settings.delayNotificationState) {
    return notifications;
  }

  const notificationId = notification.id;

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
        (notification) => notification.id !== notificationId,
      ),
    };
    return updatedNotifications;
  }

  return notifications;
}
