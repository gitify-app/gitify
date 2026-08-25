import { EVENTS } from '../../shared/events';

import { onMainEvent } from '../events';
import type AppUpdater from '../updater';

/**
 * Register IPC handlers for the application updater.
 *
 * @param appUpdater - The updater instance configured by the renderer's persisted settings.
 */
export function registerUpdaterHandlers(appUpdater: AppUpdater): void {
  onMainEvent(EVENTS.UPDATE_SHOW_UPDATE_NOTIFICATIONS, (_, enabled) => {
    appUpdater.setNotificationsEnabled(enabled);
    void appUpdater.start();
  });
}
