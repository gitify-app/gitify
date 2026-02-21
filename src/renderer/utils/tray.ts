import { useSettingsStore } from '../stores';

import { updateTrayColor, updateTrayTitle } from './comms';

/**
 * Sets the tray icon color and title based on the number of unread notifications.
 *
 * @param unreadNotifications - The number of unread notifications
 * @param isOnline - Whether the application is currently online
 */
export function setTrayIconColorAndTitle(
  unreadNotifications: number,
  isOnline: boolean,
) {
  const settings = useSettingsStore.getState();
  let title = '';
  if (
    isOnline &&
    settings.showNotificationsCountInTray &&
    unreadNotifications > 0
  ) {
    title = unreadNotifications.toString();
  }

  updateTrayColor(unreadNotifications, isOnline);
  updateTrayTitle(title);
}
