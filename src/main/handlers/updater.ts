import { app } from 'electron';

import { EVENTS, isAutomaticUpdates } from '../../shared/events';
import { logError, toError } from '../../shared/logger';

import { handleMainEvent, onMainEvent } from '../events';
import { detectUpdateManager } from '../update-manager';
import type AppUpdater from '../updater';

/**
 * Register IPC handlers for the application updater.
 *
 * @param appUpdater - The updater instance configured by the renderer's persisted settings.
 */
export function registerUpdaterHandlers(
  appUpdater: Pick<AppUpdater, 'setNotificationsEnabled' | 'setAutomaticUpdatesEnabled'>,
): void {
  const manager = detectUpdateManager({
    platform: process.platform,
    appPath: app.getAppPath(),
    executablePath: process.execPath,
    resourcesPath: process.resourcesPath,
    env: process.env,
  }).catch((error: unknown) => {
    logError('update manager', 'Installation detection failed', toError(error));
    return null;
  });
  handleMainEvent(EVENTS.UPDATE_MANAGER, () => manager);

  let revision = 0;
  onMainEvent(EVENTS.UPDATE_PREFERENCES, async (_, preferences) => {
    if (
      !preferences ||
      !isAutomaticUpdates(preferences.automaticUpdates) ||
      typeof preferences.showUpdateNotifications !== 'boolean'
    ) {
      logError('app updater', 'Invalid update preferences', new Error('Invalid IPC payload'));
      return;
    }
    const currentRevision = ++revision;
    const detectedManager = await manager;
    if (currentRevision !== revision) {
      return;
    }
    appUpdater.setNotificationsEnabled(preferences.showUpdateNotifications);
    await appUpdater.setAutomaticUpdatesEnabled(
      preferences.automaticUpdates === 'enabled' ||
        (preferences.automaticUpdates === 'default' && detectedManager === null),
    );
  });
}
