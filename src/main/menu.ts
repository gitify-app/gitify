import { Menu, MenuItem, shell } from 'electron';
import type { Menubar } from 'electron-menubar';
import { autoUpdater } from 'electron-updater';

import { APPLICATION } from '../shared/constants';
import { isMacOS } from '../shared/platform';

import { resetApp } from './lifecycle/reset';
import type { PackageManager } from './packageManager';
import { openLogsDirectory, takeScreenshot } from './utils';

/**
 * MenuBuilder constructs the right-click context menu for the tray icon and provides methods to update menu item states.
 */
export default class MenuBuilder {
  private readonly checkForUpdatesMenuItem: MenuItem;
  private readonly noUpdateAvailableMenuItem: MenuItem;
  private readonly updateAvailableMenuItem: MenuItem;
  private readonly updateReadyForInstallMenuItem: MenuItem;
  private readonly showWindowMenuItem: MenuItem;
  private readonly hideWindowMenuItem: MenuItem;

  private readonly menubar: Menubar;
  private readonly packageManager: PackageManager | null;
  private menu?: Menu;

  /**
   * @param menubar - The menubar instance used for window and app interactions within menu actions.
   * @param packageManager - The package manager that owns this install, or `null` when the app was installed manually.
   */
  constructor(menubar: Menubar, packageManager: PackageManager | null) {
    this.menubar = menubar;
    this.packageManager = packageManager;

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

    this.showWindowMenuItem = new MenuItem({
      label: `Show ${APPLICATION.NAME}`,
      visible: true,
      click: () => {
        this.menubar.showWindow();
      },
    });

    this.hideWindowMenuItem = new MenuItem({
      label: `Hide ${APPLICATION.NAME}`,
      visible: false,
      click: () => {
        this.menubar.hideWindow();
      },
    });
  }

  /**
   * Build and return the tray right-click context menu.
   */
  buildMenu(): Menu {
    this.menu = Menu.buildFromTemplate([
      this.showWindowMenuItem,
      this.hideWindowMenuItem,
      { type: 'separator' },
      ...this.buildUpdateMenuItems(),
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
              shell.openExternal(`${APPLICATION.GITHUB_BASE_URL}/${APPLICATION.REPO_SLUG}`);
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

    return this.menu;
  }

  /**
   * Build the update section of the menu.
   *
   * A package managed install never checks for updates, so it gets a note naming
   * the package manager to update through instead of controls that do nothing.
   */
  private buildUpdateMenuItems(): MenuItem[] {
    if (this.packageManager) {
      return [
        new MenuItem({
          label: `Updates are managed by ${this.packageManager}`,
          enabled: false,
        }),
      ];
    }

    return [
      this.checkForUpdatesMenuItem,
      this.noUpdateAvailableMenuItem,
      this.updateAvailableMenuItem,
      this.updateReadyForInstallMenuItem,
    ];
  }

  /**
   * Reflect the current window visibility in the Show / Hide menu items.
   * `electron-menubar` re-publishes the menu to the SNI host on every
   * show/hide automatically, so a Linux libappindicator user sees the
   * visibility flip without us touching the tray here.
   *
   * @param isVisible - Whether the popup window is currently visible.
   */
  setWindowVisibility(isVisible: boolean) {
    this.showWindowMenuItem.visible = !isVisible;
    this.hideWindowMenuItem.visible = isVisible;
  }

  /**
   * Publish in-place menu item changes to the tray.
   *
   * Linux serves libappindicator a cached serialization of the menu, so an
   * item mutated after the menu was attached keeps rendering its old state
   * until the menu is set again. A no-op on macOS and Windows.
   */
  private refreshMenu() {
    this.menubar.refreshContextMenu();
  }

  /**
   * Enable or disable the "Check for updates" menu item.
   * Disabled while an update check is in progress.
   *
   * @param enabled - Whether the menu item should be clickable.
   */
  setCheckForUpdatesMenuEnabled(enabled: boolean) {
    this.checkForUpdatesMenuItem.enabled = enabled;
    this.refreshMenu();
  }

  /**
   * Show or hide the "No updates available" status menu item.
   *
   * @param isVisible - Whether the item should be visible.
   */
  setNoUpdateAvailableMenuVisibility(isVisible: boolean) {
    this.noUpdateAvailableMenuItem.visible = isVisible;
    this.refreshMenu();
  }

  /**
   * Show or hide the "An update is available" status menu item.
   *
   * @param isVisible - Whether the item should be visible.
   */
  setUpdateAvailableMenuVisibility(isVisible: boolean) {
    this.updateAvailableMenuItem.visible = isVisible;
    this.refreshMenu();
  }

  /**
   * Show or hide the "Restart to install update" menu item.
   *
   * @param isVisible - Whether the item should be visible.
   */
  setUpdateReadyForInstallMenuVisibility(isVisible: boolean) {
    this.updateReadyForInstallMenuItem.visible = isVisible;
    this.refreshMenu();
  }
}
