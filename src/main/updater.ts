import { dialog, type MessageBoxOptions } from 'electron';
import type { Menubar } from 'electron-menubar';
import { autoUpdater, type UpdateCheckResult } from 'electron-updater';

import { APPLICATION } from '../shared/constants';
import { logError, logInfo, toError } from '../shared/logger';

import type MenuBuilder from './menu';

/**
 * Updater class for handling application updates.
 *
 * Supports scheduled and manual updates for all platforms.
 *
 * The updater stays idle until the renderer reports the "Automatic updates" setting via `setEnabled`
 *
 * Documentation: https://www.electron.build/auto-update
 *
 * NOTE: previously we tried update-electron-app (Squirrel-focused, no Linux + NSIS) before migrating to electron-updater for cross-platform support.
 */
export default class AppUpdater {
  private readonly menubar: Menubar;
  private readonly menuBuilder: MenuBuilder;
  private enabled = false;
  private started = false;
  private listenersRegistered = false;
  private noUpdateMessageTimeout?: NodeJS.Timeout;
  private periodicCheckStartTimeout?: NodeJS.Timeout;
  private periodicCheckInterval?: NodeJS.Timeout;
  private updateCheckResult: UpdateCheckResult | null = null;

  constructor(menubar: Menubar, menuBuilder: MenuBuilder) {
    this.menubar = menubar;
    this.menuBuilder = menuBuilder;
    // Disable electron-updater's own logging to avoid duplicate log messages
    // We'll handle all logging through our event listeners
    autoUpdater.logger = null;
  }

  /**
   * Enable or disable automatic update checks and update notifications.
   *
   * @param enabled - `true` to start checking for updates, `false` to stop.
   */
  async setEnabled(enabled: boolean): Promise<void> {
    this.enabled = enabled;
    this.menuBuilder.setUpdateMenuVisibility(enabled);

    if (enabled) {
      await this.start();
    } else {
      this.stop();
    }
  }

  /**
   * Start the updater: register event listeners, perform the initial update check,
   * and schedule periodic checks. Idempotent — safe to call multiple times.
   */
  private async start(): Promise<void> {
    if (this.started) {
      return; // idempotent
    }

    if (!this.menubar.app.isPackaged) {
      logInfo('app updater', 'Skipping updater since app is in development mode');
      return;
    }

    logInfo('app updater', 'Starting updater');

    this.registerListeners();
    autoUpdater.autoInstallOnAppQuit = true;
    this.started = true;

    await this.performInitialCheck();

    // The setting can be turned off while the initial check is in flight
    if (!this.enabled) {
      this.stop();
      return;
    }

    this.schedulePeriodicChecks();
  }

  /**
   * Stop the updater: cancel scheduled checks, abort any in-flight download and
   * clear all update-related UI state
   */
  private stop(): void {
    // Applied unconditionally: an update downloaded before this point would
    // otherwise still install itself the next time the app quits.
    autoUpdater.autoInstallOnAppQuit = false;
    this.updateCheckResult?.cancellationToken?.cancel();
    this.updateCheckResult = null;

    if (!this.started) {
      return;
    }

    logInfo('app updater', 'Stopping updater');

    clearTimeout(this.periodicCheckStartTimeout);
    clearInterval(this.periodicCheckInterval);
    this.periodicCheckStartTimeout = undefined;
    this.periodicCheckInterval = undefined;

    this.resetState();
    this.started = false;
  }

  /**
   * Attach all electron-updater event listeners and wire them to menu state setters.
   */
  private registerListeners() {
    if (this.listenersRegistered) {
      return;
    }
    this.listenersRegistered = true;

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
      this.showUpdateReadyDialog(event.releaseName ?? event.version);
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
    this.periodicCheckStartTimeout = setTimeout(async () => {
      await runScheduledCheck();
      this.periodicCheckInterval = setInterval(
        runScheduledCheck,
        APPLICATION.UPDATE_CHECK_INTERVAL_MS,
      );
    }, APPLICATION.UPDATE_CHECK_INTERVAL_MS);
  }

  /**
   * Check for updates, retaining the result so an in-flight download can be
   * cancelled if automatic updates are turned off.
   */
  private async checkForUpdates() {
    this.updateCheckResult = (await autoUpdater.checkForUpdatesAndNotify()) ?? null;
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
