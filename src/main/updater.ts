import log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import type { Menubar } from 'menubar';
import { updateElectronApp } from 'update-electron-app';

import { logError, logInfo } from '../shared/logger';
import type MenuBuilder from './menu';

export default class Updater {
  menubar: Menubar;
  menuBuilder: MenuBuilder;

  constructor(menubar: Menubar, menuBuilder: MenuBuilder) {
    this.menubar = menubar;
    this.menuBuilder = menuBuilder;

    updateElectronApp({
      updateInterval: '24 hours',
      logger: log,
    });

    autoUpdater.on('checking-for-update', () => {
      logInfo('auto updater', 'Checking for update');

      this.menuBuilder.setCheckForUpdatesMenuEnabled(false);
    });

    autoUpdater.on('update-available', () => {
      logInfo('auto updater', 'New update available');

      this.menubar.tray.setToolTip('Gitify\nA new update is available');
      menuBuilder.setUpdateAvailableMenuEnabled(true);
    });

    autoUpdater.on('download-progress', (progressObj) => {
      this.menubar.tray.setToolTip(
        `Gitify\nDownloading update: ${progressObj.percent} %`,
      );
    });

    autoUpdater.on('update-downloaded', () => {
      logInfo('auto updater', 'Update downloaded');

      this.menubar.tray.setToolTip('Gitify\nA new update is ready to install');
      menuBuilder.setUpdateReadyForInstallMenuEnabled(true);
    });

    autoUpdater.on('update-not-available', () => {
      logInfo('auto updater', 'Update not available');

      this.resetState();
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

  private resetState() {
    this.menubar.tray.setToolTip('Gitify');
    this.menuBuilder.setCheckForUpdatesMenuEnabled(true);
    this.menuBuilder.setUpdateAvailableMenuEnabled(false);
    this.menuBuilder.setUpdateReadyForInstallMenuEnabled(false);
  }
}
