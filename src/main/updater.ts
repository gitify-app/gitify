import { dialog, type MessageBoxOptions } from 'electron';
import type { Menubar } from 'electron-menubar';
import { autoUpdater } from 'electron-updater';

import { APPLICATION } from '../shared/constants';
import { logError, logInfo, toError } from '../shared/logger';

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
  private notificationsEnabled = true;
  private started = false;
  private noUpdateMessageTimeout?: NodeJS.Timeout;

  /**
   * @param menubar - The menubar instance whose tray and window the updater reports status through.
   * @param menuBuilder - The menu builder whose update menu items track the update state.
   */
  constructor(menubar: Menubar, menuBuilder: MenuBuilder) {
    this.menubar = menubar;
    this.menuBuilder = menuBuilder;
    // Disable electron-updater's own logging to avoid duplicate log messages
    // We'll handle all logging through our event listeners
    autoUpdater.logger = null;
  }

  /**
   * Enable or suppress update notifications without changing update checks,
   * downloads, or menubar state.
   */
  setNotificationsEnabled(enabled: boolean): void {
    this.notificationsEnabled = enabled;
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
      logInfo('app updater', 'Skipping updater since app is in development mode');
      return;
    }

    logInfo('app updater', 'Starting updater');

    this.started = true;
    this.registerListeners();
    await this.performInitialCheck();
    this.schedulePeriodicChecks();
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
      this.setTooltipWithStatus(`Downloading update: ${progressObj.percent.toFixed(2)}%`);
    });

    autoUpdater.on('update-downloaded', (event) => {
      logInfo('auto updater', 'Update downloaded');
      this.setTooltipWithStatus('A new update is ready to install');
      this.menuBuilder.setUpdateAvailableMenuVisibility(false);
      this.menuBuilder.setUpdateReadyForInstallMenuVisibility(true);
      if (this.notificationsEnabled) {
        this.showUpdateReadyDialog(event.releaseName ?? event.version);
      }
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
      await this.checkForUpdates();
    } catch (err) {
      logError('auto updater', 'Initial check failed', toError(err));
    }
  }

  /**
   * Schedule recurring update checks.
   */
  private schedulePeriodicChecks() {
    const runScheduledCheck = async () => {
      try {
        logInfo('app updater', 'Checking for updates on a periodic schedule');
        await this.checkForUpdates();
      } catch (e) {
        logError('auto updater', 'Scheduled check failed', toError(e));
      }
    };

    // Defer the first periodic check until after the interval elapses.
    // This avoids an immediate duplicate check on startup.
    setTimeout(async () => {
      await runScheduledCheck();
      setInterval(runScheduledCheck, APPLICATION.UPDATE_CHECK_INTERVAL_MS);
    }, APPLICATION.UPDATE_CHECK_INTERVAL_MS);
  }

  /**
   * Check and download updates, using electron-updater's native notification
   * only when the user has opted in.
   */
  private async checkForUpdates() {
    if (this.notificationsEnabled) {
      return await autoUpdater.checkForUpdatesAndNotify();
    }

    return await autoUpdater.checkForUpdates();
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
   * Leaves the periodic check schedule running so a cancelled or failed check
   * does not stop the app looking for later updates.
   */
  private resetState() {
    this.menubar.tray.setToolTip(APPLICATION.NAME);
    this.menuBuilder.setCheckForUpdatesMenuEnabled(true);
    this.menuBuilder.setNoUpdateAvailableMenuVisibility(false);
    this.menuBuilder.setUpdateAvailableMenuVisibility(false);
    this.menuBuilder.setUpdateReadyForInstallMenuVisibility(false);

    // Clear any pending timeout
    this.clearNoUpdateTimeout();
  }

  /**
   * Show a dialog informing the user that an update is ready to install.
   * If the user chooses to restart, quitAndInstall is called immediately.
   *
   * @param release - The release name shown in the dialog message.
   */
  private showUpdateReadyDialog(release: string) {
    const dialogOpts: MessageBoxOptions = {
      type: 'info',
      buttons: ['Restart', 'Later'],
      title: 'Application Update',
      message: `${APPLICATION.NAME} ${release} has been downloaded`,
      detail: 'Restart to apply the update. You can also restart later from the tray menu.',
    };

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  }
}
