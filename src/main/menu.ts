import { Menu, MenuItem, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import type { Menubar } from 'menubar';

import { APPLICATION } from '../shared/constants';
import { isMacOS } from '../shared/platform';

import { openLogsDirectory, resetApp, takeScreenshot } from './utils';

export default class MenuBuilder {
  private readonly checkForUpdatesMenuItem: MenuItem;
  private readonly noUpdateAvailableMenuItem: MenuItem;
  private readonly updateAvailableMenuItem: MenuItem;
  private readonly updateReadyForInstallMenuItem: MenuItem;

  menubar: Menubar;

  constructor(menubar: Menubar) {
    this.menubar = menubar;

    this.checkForUpdatesMenuItem = new MenuItem({
      label: 'Check for updates',
      enabled: true,
      click: () => {
        autoUpdater.checkForUpdatesAndNotify();
      },
    });

    this.noUpdateAvailableMenuItem = new MenuItem({
      label: 'No updates available',
      enabled: false,
      visible: false,
    });

    this.updateAvailableMenuItem = new MenuItem({
      label: 'An update is available',
      enabled: false,
      visible: false,
    });

    this.updateReadyForInstallMenuItem = new MenuItem({
      label: 'Restart to install update',
      enabled: true,
      visible: false,
      click: () => {
        autoUpdater.quitAndInstall();
      },
    });
  }

  buildMenu(): Menu {
    const contextMenu = Menu.buildFromTemplate([
      this.checkForUpdatesMenuItem,
      this.noUpdateAvailableMenuItem,
      this.updateAvailableMenuItem,
      this.updateReadyForInstallMenuItem,
      { type: 'separator' },
      {
        label: 'Developer',
        submenu: [
          {
            role: 'reload',
            accelerator: 'CommandOrControl+R',
          },
          {
            role: 'toggleDevTools',
            accelerator: isMacOS() ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
          },
          {
            label: 'Take Screenshot',
            accelerator: 'CommandOrControl+S',
            click: () => takeScreenshot(this.menubar),
          },
          {
            label: 'View Application Logs',
            click: () => openLogsDirectory(),
          },
          {
            label: 'Visit Repository',
            click: () => {
              shell.openExternal(`https://github.com/${APPLICATION.REPO_SLUG}`);
            },
          },
          {
            label: `Reset ${APPLICATION.NAME}`,
            click: () => {
              resetApp(this.menubar);
            },
          },
        ],
      },
      { type: 'separator' },
      {
        label: 'Visit Website',
        click: () => {
          shell.openExternal(APPLICATION.WEBSITE);
        },
      },
      {
        label: `Quit ${APPLICATION.NAME}`,
        accelerator: 'CommandOrControl+Q',
        click: () => {
          this.menubar.app.quit();
        },
      },
    ]);

    return contextMenu;
  }

  setCheckForUpdatesMenuEnabled(enabled: boolean) {
    this.checkForUpdatesMenuItem.enabled = enabled;
  }

  setNoUpdateAvailableMenuVisibility(isVisible: boolean) {
    this.noUpdateAvailableMenuItem.visible = isVisible;
  }

  setUpdateAvailableMenuVisibility(isVisible: boolean) {
    this.updateAvailableMenuItem.visible = isVisible;
  }

  setUpdateReadyForInstallMenuVisibility(isVisible: boolean) {
    this.updateReadyForInstallMenuItem.visible = isVisible;
  }

  isUpdateAvailable() {
    return (
      this.updateAvailableMenuItem.visible ||
      this.updateReadyForInstallMenuItem.visible
    );
  }
}
