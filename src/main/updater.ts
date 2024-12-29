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

    autoUpdater.on('error', (err) => {
      logError('auto updater', 'Error checking for update', err);
      this.menuBuilder.setCheckForUpdatesMenuEnabled(true);
    });

    autoUpdater.on('update-available', () => {
      logInfo('auto updater', 'New update available');
      menuBuilder.setUpdateAvailableMenuEnabled(true);
      this.menubar.tray.setToolTip('Gitify\nA new update is available');
    });

    autoUpdater.on('update-downloaded', () => {
      logInfo('auto updater', 'Update downloaded');
      menuBuilder.setUpdateReadyForInstallMenuEnabled(true);
      this.menubar.tray.setToolTip('Gitify\nA new update is ready to install');
    });

    autoUpdater.on('update-not-available', () => {
      logInfo('auto updater', 'Update not available');
      this.menuBuilder.setCheckForUpdatesMenuEnabled(true);
    });
  }
}
