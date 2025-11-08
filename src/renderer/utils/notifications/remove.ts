import type { AccountNotifications, SettingsState } from '../../types';
import type { Notification } from '../../typesGitHub';
import { findAccountIndex } from './notifications';

export function removeNotifications(
  settings: SettingsState,
  notificationsToRemove: Notification[],
  allNotifications: AccountNotifications[],
): AccountNotifications[] {
  if (notificationsToRemove.length === 0) {
    return allNotifications;
  }

  const removeIds = new Set(notificationsToRemove.map((n) => n.id));

  // If delay notifications is enabled, mark notifications as read but do not remove them
  if (settings.delayNotificationState) {
    return allNotifications.map((account) => ({
      ...account,
      notifications: account.notifications.map((notification) =>
        removeIds.has(notification.id)
          ? { ...notification, unread: false }
          : notification,
      ),
    }));
  }

  const accountIndex = findAccountIndex(
    allNotifications,
    notificationsToRemove[0],
  );

  if (accountIndex === -1) {
    return allNotifications;
  }

  const updatedNotifications = [...allNotifications];
  updatedNotifications[accountIndex] = {
    ...updatedNotifications[accountIndex],
    notifications: updatedNotifications[accountIndex].notifications.filter(
      (notification) => !removeIds.has(notification.id),
    ),
  };
  return updatedNotifications;
}
