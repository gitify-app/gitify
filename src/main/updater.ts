import { dialog, type MessageBoxOptions } from 'electron';
import { autoUpdater } from 'electron-updater';
import type { Menubar } from 'menubar';

import { APPLICATION } from '../shared/constants';
import { logError, logInfo } from '../shared/logger';

import type MenuBuilder from './menu';

/**
 * Updater class for handling application updates.
 *
 * Supports scheduled and manual updates for all platforms.
 *
 * Documentation: https://www.electron.build/auto-update
 *
 * NOTE: previously we tried update-electron-app (Squirrel-focused, no Linux + NSIS) before migrating to electron-updater for cross-platform support.
 */
export default class AppUpdater {
  private readonly menubar: Menubar;
  private readonly menuBuilder: MenuBuilder;
  private started = false;
  private noUpdateMessageTimeout?: NodeJS.Timeout;
  private periodicInterval?: NodeJS.Timeout;

  constructor(menubar: Menubar, menuBuilder: MenuBuilder) {
    this.menubar = menubar;
    this.menuBuilder = menuBuilder;
    // Disable electron-updater's own logging to avoid duplicate log messages
    // We'll handle all logging through our event listeners
    autoUpdater.logger = null;
  }

  /**
   * Start the updater: register event listeners, perform the initial update check,
   * and schedule periodic checks. Idempotent — safe to call multiple times.
   */
  async start(): Promise<void> {
    if (this.started) {
      return; // idempotent
    }

    if (!this.menubar.app.isPackaged) {
      logInfo(
        'app updater',
        'Skipping updater since app is in development mode',
      );
      return;
    }

    logInfo('app updater', 'Starting updater');

    this.registerListeners();
    await this.performInitialCheck();
    this.schedulePeriodicChecks();

    this.started = true;
  }

  /**
   * Attach all electron-updater event listeners and wire them to menu state setters.
   */
  private registerListeners() {
    autoUpdater.on('checking-for-update', () => {
      logInfo('auto updater', 'Checking for update');
      this.menuBuilder.setCheckForUpdatesMenuEnabled(false);
      this.menuBuilder.setNoUpdateAvailableMenuVisibility(false);

      // Clear any existing timeout when starting a new check
      this.clearNoUpdateTimeout();
    });

    autoUpdater.on('update-available', () => {
      logInfo('auto updater', 'Update available');
      this.setTooltipWithStatus('A new update is available');
      this.menuBuilder.setUpdateAvailableMenuVisibility(true);
    });

    autoUpdater.on('download-progress', (progressObj) => {
      this.setTooltipWithStatus(
        `Downloading update: ${progressObj.percent.toFixed(2)}%`,
      );
    });

    autoUpdater.on('update-downloaded', (event) => {
      logInfo('auto updater', 'Update downloaded');
      this.setTooltipWithStatus('A new update is ready to install');
      this.menuBuilder.setUpdateAvailableMenuVisibility(false);
      this.menuBuilder.setUpdateReadyForInstallMenuVisibility(true);
      this.showUpdateReadyDialog(event.releaseName);
    });

    autoUpdater.on('update-not-available', () => {
      logInfo('auto updater', 'Update not available');
      this.menuBuilder.setCheckForUpdatesMenuEnabled(true);
      this.menuBuilder.setNoUpdateAvailableMenuVisibility(true);
      this.menuBuilder.setUpdateAvailableMenuVisibility(false);
      this.menuBuilder.setUpdateReadyForInstallMenuVisibility(false);

      // Auto-hide the "no updates available" message
      this.clearNoUpdateTimeout();
      this.noUpdateMessageTimeout = setTimeout(() => {
        this.menuBuilder.setNoUpdateAvailableMenuVisibility(false);
      }, APPLICATION.UPDATE_NOT_AVAILABLE_DISPLAY_MS);
    });

    autoUpdater.on('update-cancelled', () => {
      logInfo('auto updater', 'Update cancelled');
      this.resetState();
    });

    autoUpdater.on('error', (err) => {
      logError('auto updater', 'Error checking for update', err);
      this.resetState();
    });
  }

  /**
   * Run an immediate update check on application launch.
   */
  private async performInitialCheck() {
    try {
      logInfo('app updater', 'Checking for updates on application launch');
      await autoUpdater.checkForUpdatesAndNotify();
    } catch (err) {
      logError('auto updater', 'Initial check failed', err as Error);
    }
  }

  /**
   * Schedule recurring update checks.
   */
  private schedulePeriodicChecks() {
    const runScheduledCheck = async () => {
      try {
        logInfo('app updater', 'Checking for updates on a periodic schedule');
        await autoUpdater.checkForUpdatesAndNotify();
      } catch (e) {
        logError('auto updater', 'Scheduled check failed', e as Error);
      }
    };

    // Defer the first periodic check until after the interval elapses.
    // This avoids an immediate duplicate check on startup.
    setTimeout(async () => {
      await runScheduledCheck();
      this.periodicInterval = setInterval(
        runScheduledCheck,
        APPLICATION.UPDATE_CHECK_INTERVAL_MS,
      );
    }, APPLICATION.UPDATE_CHECK_INTERVAL_MS);
  }

  /**
   * Update the tray tooltip to show the application name alongside a status message.
   *
   * @param status - The status string appended below the application name.
   */
  private setTooltipWithStatus(status: string) {
    this.menubar.tray.setToolTip(`${APPLICATION.NAME}\n${status}`);
  }

  /**
   * Cancel the pending timeout that hides the "no update available" menu item, if any.
   */
  private clearNoUpdateTimeout() {
    if (this.noUpdateMessageTimeout) {
      clearTimeout(this.noUpdateMessageTimeout);
      this.noUpdateMessageTimeout = undefined;
    }
  }

  /**
   * Reset tray tooltip and all update-related menu items to their default state.
   */
  private resetState() {
    this.menubar.tray.setToolTip(APPLICATION.NAME);
    this.menuBuilder.setCheckForUpdatesMenuEnabled(true);
    this.menuBuilder.setNoUpdateAvailableMenuVisibility(false);
    this.menuBuilder.setUpdateAvailableMenuVisibility(false);
    this.menuBuilder.setUpdateReadyForInstallMenuVisibility(false);

    // Clear any pending timeout
    this.clearNoUpdateTimeout();

    // Clear periodic interval if present
    if (this.periodicInterval) {
      clearInterval(this.periodicInterval);
      this.periodicInterval = undefined;
    }
  }

  /**
   * Show a dialog informing the user that an update is ready to install.
   * If the user chooses to restart, quitAndInstall is called immediately.
   *
   * @param releaseName - The version string shown in the dialog message.
   */
  private showUpdateReadyDialog(releaseName: string) {
    const dialogOpts: MessageBoxOptions = {
      type: 'info',
      buttons: ['Restart', 'Later'],
      title: 'Application Update',
      message: `${APPLICATION.NAME} ${releaseName} has been downloaded`,
      detail:
        'Restart to apply the update. You can also restart later from the tray menu.',
    };

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  }
}
