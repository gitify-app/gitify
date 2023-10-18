import { AccountNotifications } from '../types';

export const removeNotification = (
  id: string,
  notifications: AccountNotifications[],
  hostname: string,
): AccountNotifications[] => {
  const accountIndex = notifications.findIndex(
    (accountNotifications) => accountNotifications.hostname === hostname,
  );

  if (accountIndex !== -1) {
    const updatedNotifications = [...notifications];
    updatedNotifications[accountIndex] = {
      ...updatedNotifications[accountIndex],
      notifications: updatedNotifications[accountIndex].notifications.filter(
        (notification) => notification.id !== id,
      ),
    };
    return updatedNotifications;
  }

  return notifications;
};
