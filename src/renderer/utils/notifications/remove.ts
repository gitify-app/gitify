import type {
  Account,
  AccountNotifications,
  GitifyNotification,
  SettingsState,
} from '../../types';
import { getAccountUUID } from '../auth/utils';

/**
 * Determine if notifications should be removed from state or marked as read in-place.
 *
 * When `delayNotificationState` or `fetchReadNotifications` is enabled,
 * notifications stay in the list with reduced opacity instead of being removed.
 */
export function shouldRemoveNotificationsFromState(
  settings: SettingsState,
): boolean {
  return !settings.delayNotificationState && !settings.fetchReadNotifications;
}

/**
 * Remove notifications from the account notifications list.
 *
 * When `delayNotificationState` or `fetchReadNotifications` is enabled,
 * notifications are marked as read instead of being removed from the list.
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

  const shouldRemove = shouldRemoveNotificationsFromState(settings);

  return accountNotifications.map((accountNotifications) =>
    getAccountUUID(account) === getAccountUUID(accountNotifications.account)
      ? {
          ...accountNotifications,
          notifications: shouldRemove
            ? accountNotifications.notifications.filter(
                (notification) => !notificationIDsToRemove.has(notification.id),
              )
            : accountNotifications.notifications.map((notification) =>
                notificationIDsToRemove.has(notification.id)
                  ? { ...notification, unread: false }
                  : notification,
              ),
        }
      : accountNotifications,
  );
}
