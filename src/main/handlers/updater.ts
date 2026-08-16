import { EVENTS } from '../../shared/events';

import { onMainEvent } from '../events';
import type AppUpdater from '../updater';

/**
 * Register IPC handlers for the application updater.
 *
 * @param appUpdater - The updater instance driven by the renderer's automatic updates setting.
 */
export function registerUpdaterHandlers(appUpdater: AppUpdater): void {
  /**
   * Enable or disable automatic update checks and update notifications.
   *
   * The renderer sends the current value on startup, which is what starts the
   * updater in the first place.
   */
  onMainEvent(EVENTS.UPDATE_AUTOMATIC_UPDATES, (_, enabled: boolean) => {
    appUpdater.setEnabled(enabled);
  });
}
