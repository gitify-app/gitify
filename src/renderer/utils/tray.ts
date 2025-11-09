import type { SettingsState } from '../types';
import { updateTrayColor, updateTrayTitle } from './comms';

/**
 * Sets the tray icon color and title based on the number of unread notifications.
 *
 * @param unreadNotifications - The number of unread notifications
 * @param settings - The application settings
 */
export function setTrayIconColorAndTitle(
  unreadNotifications: number,
  settings: SettingsState,
) {
  let title = '';
  if (settings.showNotificationsCountInTray && unreadNotifications > 0) {
    title = unreadNotifications.toString();
  }

  updateTrayColor(unreadNotifications);
  updateTrayTitle(title);
}
