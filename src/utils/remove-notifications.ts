import type { AccountNotifications } from '../types';
import type { Notification } from '../typesGitHub';
import { getAccountUUID } from './auth/utils';

export function removeNotifications(
  notification: Notification,
  notifications: AccountNotifications[],
): AccountNotifications[] {
  const repoSlug = notification.repository.full_name;

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
        (notification) => notification.repository.full_name !== repoSlug,
      ),
    };
    return updatedNotifications;
  }

  return notifications;
}
