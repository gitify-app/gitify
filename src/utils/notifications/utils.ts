import type { AccountNotifications, GitifyNotification } from '../../types';
import { getAccountUUID } from '../auth/utils';

/**
 * Find notifications that exist in newNotifications but not in previousNotifications
 */
export function getNewNotifications(
  previousAccountNotifications: AccountNotifications[],
  newAccountNotifications: AccountNotifications[],
): GitifyNotification[] {
  return newAccountNotifications.flatMap((accountNotifications) => {
    const accountPreviousNotifications = previousAccountNotifications.find(
      (item) =>
        getAccountUUID(item.account) ===
        getAccountUUID(accountNotifications.account),
    );

    if (!accountPreviousNotifications) {
      return accountNotifications.notifications;
    }

    const previousIds = new Set(
      accountPreviousNotifications.notifications.map((item) => item.id),
    );

    return accountNotifications.notifications.filter(
      (notification) => !previousIds.has(notification.id),
    );
  });
}
