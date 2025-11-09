import type { AccountNotifications } from '../../types';
import type { Notification } from '../../typesGitHub';
import { getAccountUUID } from '../auth/utils';

/**
 * Find notifications that exist in newNotifications but not in previousNotifications
 */
export function getNewNotifications(
  previousNotifications: AccountNotifications[],
  newNotifications: AccountNotifications[],
): Notification[] {
  return newNotifications.flatMap((accountNotifications) => {
    const accountPreviousNotifications = previousNotifications.find(
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
