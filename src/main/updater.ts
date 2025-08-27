import { dialog, type MessageBoxOptions } from 'electron';
import log from 'electron-log';
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
 * NOTE: previously used update-electron-app (Squirrel-focused, no Linux + NSIS). electron-updater gives cross-platform support.
 * Caller guarantees app is ready before initialize() is invoked.
 */
export default class AppUpdater {
  private readonly menubar: Menubar;
  private readonly menuBuilder: MenuBuilder;
  private started = false;

  constructor(menubar: Menubar, menuBuilder: MenuBuilder) {
    this.menubar = menubar;
    this.menuBuilder = menuBuilder;
    autoUpdater.logger = log;
  }

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

  private registerListeners() {
    autoUpdater.on('checking-for-update', () => {
      logInfo('auto updater', 'Checking for update');
      this.menuBuilder.setCheckForUpdatesMenuEnabled(false);
      this.menuBuilder.setNoUpdateAvailableMenuVisibility(false);
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

  private async performInitialCheck() {
    try {
      logInfo('app updater', 'Checking for updates on application launch');
      await autoUpdater.checkForUpdatesAndNotify();
    } catch (e) {
      logError('auto updater', 'Initial check failed', e as Error);
    }
  }

  private schedulePeriodicChecks() {
    setInterval(async () => {
      try {
        logInfo('app updater', 'Checking for updates on a periodic schedule');
        await autoUpdater.checkForUpdatesAndNotify();
      } catch (e) {
        logError('auto updater', 'Scheduled check failed', e as Error);
      }
    }, APPLICATION.UPDATE_CHECK_INTERVAL_MS);
  }

  private setTooltipWithStatus(status: string) {
    this.menubar.tray.setToolTip(`${APPLICATION.NAME}\n${status}`);
  }

  private resetState() {
    this.menubar.tray.setToolTip(APPLICATION.NAME);
    this.menuBuilder.setCheckForUpdatesMenuEnabled(true);
    this.menuBuilder.setNoUpdateAvailableMenuVisibility(false);
    this.menuBuilder.setUpdateAvailableMenuVisibility(false);
    this.menuBuilder.setUpdateReadyForInstallMenuVisibility(false);
  }

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
      if (returnValue.response === 0) autoUpdater.quitAndInstall();
    });
  }
}
