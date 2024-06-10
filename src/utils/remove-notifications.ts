import type { AccountNotifications } from '../types';
import type { HostName } from './branded-types';

export const removeNotifications = (
  repoSlug: string,
  notifications: AccountNotifications[],
  hostname: HostName,
): AccountNotifications[] => {
  const accountIndex = notifications.findIndex(
    (accountNotifications) =>
      accountNotifications.account.hostname === hostname,
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
};
