import { Menu, MenuItem, shell } from 'electron';
import type { Menubar } from 'electron-menubar';

import { APPLICATION } from '../shared/constants';
import { logError, toError } from '../shared/logger';
import { isMacOS } from '../shared/platform';

import { i18n } from './language';
import { resetApp } from './lifecycle/reset';
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
  private menu?: Menu;
  private automaticUpdatesEnabled = false;
  private checkForUpdates = async (): Promise<void> => {};
  private installUpdate = (): void => {};

  /**
   * @param menubar - The menubar instance used for window and app interactions within menu actions.
   */
  constructor(menubar: Menubar) {
    this.menubar = menubar;
    i18n.on('languageChanged', () => {
      if (this.menu) {
        this.menubar.setContextMenu(this.buildMenu());
      }
    });

    this.checkForUpdatesMenuItem = new MenuItem({
      label: i18n.t('native:menu.view_releases', 'View releases'),
      enabled: true,
      click: () => {
        const check = this.automaticUpdatesEnabled
          ? this.checkForUpdates()
          : shell.openExternal(
              `${APPLICATION.GITHUB_BASE_URL}/${APPLICATION.REPO_SLUG}/releases/latest`,
            );
        void check?.catch((error: unknown) => {
          logError('menu', 'Failed to check for updates or open releases', toError(error));
        });
      },
    });

    this.noUpdateAvailableMenuItem = new MenuItem({
      label: i18n.t('native:menu.no_updates', 'No updates available'),
      enabled: false,
      visible: false,
    });

    this.updateAvailableMenuItem = new MenuItem({
      label: i18n.t('native:menu.update_available', 'An update is available'),
      enabled: false,
      visible: false,
    });

    this.updateReadyForInstallMenuItem = new MenuItem({
      label: i18n.t('native:menu.install_update', 'Restart to install update'),
      enabled: true,
      visible: false,
      click: () => {
        if (this.automaticUpdatesEnabled) {
          this.installUpdate();
        }
      },
    });

    this.showWindowMenuItem = new MenuItem({
      label: i18n.t('native:menu.show', 'Show {{appName}}', { appName: APPLICATION.NAME }),
      visible: true,
      click: () => {
        this.menubar.showWindow().catch((err) => {
          logError('menu', 'Failed to show window', toError(err));
        });
      },
    });

    this.hideWindowMenuItem = new MenuItem({
      label: i18n.t('native:menu.hide', 'Hide {{appName}}', { appName: APPLICATION.NAME }),
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
    this.checkForUpdatesMenuItem.label = this.automaticUpdatesEnabled
      ? i18n.t('native:menu.check_updates', 'Check for updates')
      : i18n.t('native:menu.view_releases', 'View releases');
    this.noUpdateAvailableMenuItem.label = i18n.t('native:menu.no_updates', 'No updates available');
    this.updateAvailableMenuItem.label = i18n.t(
      'native:menu.update_available',
      'An update is available',
    );
    this.updateReadyForInstallMenuItem.label = i18n.t(
      'native:menu.install_update',
      'Restart to install update',
    );
    this.showWindowMenuItem.label = i18n.t('native:menu.show', 'Show {{appName}}', {
      appName: APPLICATION.NAME,
    });
    this.hideWindowMenuItem.label = i18n.t('native:menu.hide', 'Hide {{appName}}', {
      appName: APPLICATION.NAME,
    });
    this.menu = Menu.buildFromTemplate([
      this.showWindowMenuItem,
      this.hideWindowMenuItem,
      { type: 'separator' },
      this.checkForUpdatesMenuItem,
      this.noUpdateAvailableMenuItem,
      this.updateAvailableMenuItem,
      this.updateReadyForInstallMenuItem,
      { type: 'separator' },
      {
        label: i18n.t('native:menu.developer', 'Developer'),
        submenu: [
          {
            role: 'reload',
            label: i18n.t('native:menu.reload', 'Reload'),
            accelerator: 'CommandOrControl+R',
          },
          {
            role: 'toggleDevTools',
            label: i18n.t('native:menu.devtools', 'Toggle Developer Tools'),
            accelerator: isMacOS() ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
          },
          {
            label: i18n.t('native:menu.screenshot', 'Take Screenshot'),
            accelerator: 'CommandOrControl+S',
            click: () => takeScreenshot(this.menubar),
          },
          {
            label: i18n.t('native:menu.logs', 'View Application Logs'),
            click: () => openLogsDirectory(),
          },
          {
            label: i18n.t('native:menu.repository', 'Visit Repository'),
            click: () => {
              shell
                .openExternal(`${APPLICATION.GITHUB_BASE_URL}/${APPLICATION.REPO_SLUG}`)
                .catch((err) => {
                  logError('menu', 'Failed to open repository in browser', toError(err));
                });
            },
          },
          {
            label: i18n.t('native:menu.reset', 'Reset {{appName}}', { appName: APPLICATION.NAME }),
            click: () => {
              resetApp(this.menubar);
            },
          },
        ],
      },
      { type: 'separator' },
      {
        label: i18n.t('native:menu.website', 'Visit Website'),
        click: () => {
          shell.openExternal(APPLICATION.WEBSITE).catch((err) => {
            logError('menu', 'Failed to open website in browser', toError(err));
          });
        },
      },
      {
        label: i18n.t('native:menu.quit', 'Quit {{appName}}', { appName: APPLICATION.NAME }),
        accelerator: 'CommandOrControl+Q',
        click: () => {
          this.menubar.app.quit();
        },
      },
    ]);

    return this.menu;
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
   * Connect the update menu items to the updater.
   *
   * @param actions - Callbacks that check for updates and install a downloaded update.
   */
  setUpdateActions(actions: { check: () => Promise<void>; install: () => void }) {
    this.checkForUpdates = actions.check;
    this.installUpdate = actions.install;
  }

  /**
   * Switch the update menu item between checking for updates and viewing releases.
   *
   * @param enabled - Whether Gitify handles updates itself.
   */
  setAutomaticUpdatesEnabled(enabled: boolean) {
    this.automaticUpdatesEnabled = enabled;
    this.checkForUpdatesMenuItem.label = enabled
      ? i18n.t('native:menu.check_updates', 'Check for updates')
      : i18n.t('native:menu.view_releases', 'View releases');
    this.refreshMenu();
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
