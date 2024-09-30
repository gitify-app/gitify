import { Menu, MenuItem } from 'electron';
import { autoUpdater } from 'electron-updater';
import type { Menubar } from 'menubar';
import { resetApp, takeScreenshot } from './utils';

export default class MenuBuilder {
  private checkForUpdatesMenuItem: MenuItem;
  private updateAvailableMenuItem: MenuItem;
  private updateReadyForInstallMenuItem: MenuItem;

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

    this.updateAvailableMenuItem = new MenuItem({
      label: 'An update is available',
      enabled: false,
      visible: false,
    });

    this.updateReadyForInstallMenuItem = new MenuItem({
      label: 'Restart to update',
      visible: false,
      click: () => {
        autoUpdater.quitAndInstall();
      },
    });
  }

  buildMenu(): Menu {
    const contextMenu = Menu.buildFromTemplate([
      this.checkForUpdatesMenuItem,
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
            accelerator:
              process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
          },
          {
            label: 'Take Screenshot',
            accelerator: 'CommandOrControl+S',
            click: () => takeScreenshot(this.menubar),
          },
          {
            label: 'Reset App',
            click: () => {
              resetApp(this.menubar);
            },
          },
        ],
      },
      { type: 'separator' },
      {
        label: 'Quit Gitify',
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

  setUpdateAvailableMenuEnabled(enabled: boolean) {
    this.updateAvailableMenuItem.enabled = enabled;
  }

  setUpdateReadyForInstallMenuEnabled(enabled: boolean) {
    this.updateReadyForInstallMenuItem.enabled = enabled;
  }

  isUpdateAvailableMenuVisible() {
    return this.updateAvailableMenuItem.visible;
  }
}
