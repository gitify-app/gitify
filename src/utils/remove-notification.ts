import {
  ANIMATE_NOTIFICATION_CLASS_NAME,
  READ_NOTIFICATION_CLASS_NAME,
} from '../styles/gitify';
import type { AccountNotifications, SettingsState } from '../types';
import type { Notification } from '../typesGitHub';
import { getAccountUUID } from './auth/utils';

export const removeNotification = (
  settings: SettingsState,
  notification: Notification,
  notifications: AccountNotifications[],
): AccountNotifications[] => {
  if (settings.delayNotificationState) {
    const notificationRow = document.getElementById(notification.id);
    notificationRow.className += ` ${READ_NOTIFICATION_CLASS_NAME}`;
    return notifications;
  }

  const notificationRow = document.getElementById(notification.id);
  notificationRow.className += ` ${ANIMATE_NOTIFICATION_CLASS_NAME}`;

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
