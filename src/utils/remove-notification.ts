import { READ_NOTIFICATION_CLASS_NAME } from '../styles/gitify';
import type { AccountNotifications, SettingsState } from '../types';

export const removeNotification = (
  settings: SettingsState,
  id: string,
  notifications: AccountNotifications[],
  hostname: string,
): AccountNotifications[] => {
  if (settings.delayNotificationState) {
    const notificationRow = document.getElementById(id);
    notificationRow.className += ` ${READ_NOTIFICATION_CLASS_NAME}`;
    return notifications;
  }

  const accountIndex = notifications.findIndex(
    (accountNotifications) =>
      accountNotifications.account.hostname === hostname,
  );

  if (accountIndex !== -1) {
    const updatedNotifications = [...notifications];
    updatedNotifications[accountIndex] = {
      ...updatedNotifications[accountIndex],
      notifications: updatedNotifications[accountIndex].notifications.filter(
        (notification) => notification.id !== id,
      ),
    };
    return updatedNotifications;
  }

  return notifications;
};
