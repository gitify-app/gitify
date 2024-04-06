import type { AccountNotifications } from "../types";

export const removeNotifications = (
  repoSlug: string,
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
        (notification) => notification.repository.full_name !== repoSlug,
      ),
    };
    return updatedNotifications;
  }

  return notifications;
};
