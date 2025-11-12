import type { Account, AccountNotifications, SettingsState } from '../../types';
import type { Notification } from '../../typesGitHub';
import { getAccountUUID } from '../auth/utils';

/**
 * Remove notifications from the account notifications list.
 *
 * If delayNotificationState is enabled in settings, mark notifications as read instead of removing them.
 */
export function removeNotificationsForAccount(
  account: Account,
  settings: SettingsState,
  notificationsToRemove: Notification[],
  allNotifications: AccountNotifications[],
): AccountNotifications[] {
  if (notificationsToRemove.length === 0) {
    return allNotifications;
  }

  const notificationIDsToRemove = new Set(
    notificationsToRemove.map((n) => n.id),
  );

  return allNotifications.map((accountNotifications) =>
    getAccountUUID(account) === getAccountUUID(accountNotifications.account)
      ? {
          ...accountNotifications,
          notifications: settings.delayNotificationState
            ? accountNotifications.notifications.map((notification) =>
                notificationIDsToRemove.has(notification.id)
                  ? { ...notification, unread: false }
                  : notification,
              )
            : accountNotifications.notifications.filter(
                (notification) => !notificationIDsToRemove.has(notification.id),
              ),
        }
      : accountNotifications,
  );
}
