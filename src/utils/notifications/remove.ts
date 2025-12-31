import type {
  Account,
  AccountNotifications,
  GitifyNotification,
  SettingsState,
} from '../../types';
import { getAccountUUID } from '../auth/utils';

/**
 * Remove notifications from the account notifications list.
 *
 * If delayNotificationState is enabled in settings, mark notifications as read instead of removing them.
 */
export function removeNotificationsForAccount(
  account: Account,
  settings: SettingsState,
  notificationsToRemove: GitifyNotification[],
  accountNotifications: AccountNotifications[],
): AccountNotifications[] {
  if (notificationsToRemove.length === 0) {
    return accountNotifications;
  }

  const notificationIDsToRemove = new Set(
    notificationsToRemove.map((notification) => notification.id),
  );

  return accountNotifications.map((accountNotifications) =>
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
