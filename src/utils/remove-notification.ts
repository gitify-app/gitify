import type { AccountNotifications, SettingsState } from '../types';
import type { Notification } from '../typesGitHub';
import { getAccountUUID } from './auth/utils';
import Constants from './constants';

export const removeNotification = (
  settings: SettingsState,
  notification: Notification,
  notifications: AccountNotifications[],
): AccountNotifications[] => {
  if (settings.delayNotificationState) {
    const notificationRow = document.getElementById(notification.id);
    notificationRow.className += ` ${Constants.READ_CLASS_NAME}`;
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
};
