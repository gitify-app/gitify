import type { AccountNotifications, SettingsState } from '../types';
import type { Notification } from '../typesGitHub';
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

  // TODO Adam - FIX ME
  const accountIndex = notifications.findIndex(
    (accountNotifications) =>
      accountNotifications.account.hostname === notification.account.hostname,
  );

  if (accountIndex !== -1) {
    const updatedNotifications = [...notifications];
    updatedNotifications[accountIndex] = {
      ...updatedNotifications[accountIndex],
      notifications: updatedNotifications[accountIndex].notifications.filter(
        (notif) => notif.id !== notification.id,
      ),
    };
    return updatedNotifications;
  }

  return notifications;
};
