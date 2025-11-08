import type { AccountNotifications, SettingsState } from '../../types';
import { updateTrayColor, updateTrayTitle } from '../comms';
import { getUnreadNotificationCount } from './notifications';

/**
 * Sets the tray icon color and title based on the number of unread notifications.
 *
 * @param notifications
 * @param settings
 */
export function setTrayIconColorAndTitle(
  notifications: AccountNotifications[],
  settings: SettingsState,
) {
  const totalUnreadNotifications = getUnreadNotificationCount(notifications);

  let title = '';
  if (settings.showNotificationsCountInTray && totalUnreadNotifications > 0) {
    title = totalUnreadNotifications.toString();
  }

  updateTrayColor(totalUnreadNotifications);
  updateTrayTitle(title);
}
