import type { AccountNotifications, SettingsState } from '../../types';
import type { Notification } from '../../typesGitHub';
import { getAccountUUID } from '../auth/utils';

export function removeNotifications(
  settings: SettingsState,
  notificationsToRemove: Notification[],
  allNotifications: AccountNotifications[],
): AccountNotifications[] {
  if (settings.delayNotificationState) {
    return allNotifications;
  }

  if (notificationsToRemove.length === 0) {
    return allNotifications;
  }

  const removeNotificationAccount = notificationsToRemove[0].account;
  const removeNotificationIDs = new Set<string>(
    notificationsToRemove.map((notification) => notification.id),
  );

  const accountIndex = allNotifications.findIndex(
    (accountNotifications) =>
      getAccountUUID(accountNotifications.account) ===
      getAccountUUID(removeNotificationAccount),
  );

  if (accountIndex !== -1) {
    const updatedNotifications = [...allNotifications];
    updatedNotifications[accountIndex] = {
      ...updatedNotifications[accountIndex],
      notifications: updatedNotifications[accountIndex].notifications.filter(
        (notification) => !removeNotificationIDs.has(notification.id),
      ),
    };
    return updatedNotifications;
  }

  return allNotifications;
}
