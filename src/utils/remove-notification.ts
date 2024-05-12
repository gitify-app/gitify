import type { AccountNotifications, SettingsState } from '../types';
import Constants from './constants';

export const removeNotification = (
  settings: SettingsState,
  id: string,
  notifications: AccountNotifications[],
  hostname: string,
): AccountNotifications[] => {
  if (settings.delayNotificationState) {
    const notificationRow = document.getElementById(id);
    notificationRow.className += ` ${Constants.READ_CLASS_NAME}`;
    return notifications;
  }

  const accountIndex = notifications.findIndex(
    (accountNotifications) => accountNotifications.hostname === hostname,
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
