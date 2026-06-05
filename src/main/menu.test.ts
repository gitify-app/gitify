import { Menu, shell } from 'electron';
import type { Menubar } from 'electron-menubar';
import { autoUpdater } from 'electron-updater';

import type { Mock } from 'vitest';

import { APPLICATION } from '../shared/constants';
import { isMacOS } from '../shared/platform';

import { resetApp } from './lifecycle/reset';
import MenuBuilder from './menu';
import { openLogsDirectory, takeScreenshot } from './utils';

// Track MenuItem instantiations for test assertions
const menuItemInstances: Array<{
  label?: string;
  enabled?: boolean;
  visible?: boolean;
  click?: () => void;
}> = [];

vi.mock('electron', () => {
  class MockMenuItem {
    constructor(opts: Record<string, unknown>) {
      Object.assign(this, opts);
      menuItemInstances.push(opts as (typeof menuItemInstances)[number]);
    }
  }
  return {
    Menu: {
      buildFromTemplate: vi.fn(),
    } satisfies Pick<typeof Electron.Menu, 'buildFromTemplate'>,
    MenuItem: MockMenuItem,
    shell: {
      openExternal: vi.fn(),
    } satisfies Pick<Electron.Shell, 'openExternal'>,
  };
});

vi.mock('electron-updater', () => ({
  autoUpdater: {
    checkForUpdatesAndNotify: vi.fn(),
    quitAndInstall: vi.fn(),
  },
}));

vi.mock('./utils', () => ({
  takeScreenshot: vi.fn(),
  openLogsDirectory: vi.fn(),
}));

vi.mock('./lifecycle/reset', () => ({
  resetApp: vi.fn(),
}));

vi.mock('../shared/platform', () => ({
  isMacOS: vi.fn(),
}));

describe('main/menu.ts', () => {
  let menubar: Menubar;
  let menuBuilder: MenuBuilder;

  /** Helper: find MenuItem config captured via our tracking array by label */
  const getMenuItemConfigByLabel = (label: string) =>
    menuItemInstances.find((item) => item.label === label) as
      | {
          label?: string;
          enabled?: boolean;
          visible?: boolean;
          click?: () => void;
        }
      | undefined;

  /** Lightweight type describing the (subset) of fields we inspect on template items */
  type TemplateItem = {
    label?: string;
    role?: string;
    accelerator?: string;
    submenu?: TemplateItem[];
    click?: () => void;
  };

  /** Helper: build menu & return template (first arg passed to buildFromTemplate) */
  const buildAndGetTemplate = () => {
    menuBuilder.buildMenu();
    return (Menu.buildFromTemplate as Mock).mock.calls.slice(-1)[0][0] as TemplateItem[];
  };

  beforeEach(() => {
    vi.mocked(isMacOS).mockReturnValue(false);
    menuItemInstances.length = 0; // Clear tracked instances
    menubar = {
      app: { quit: vi.fn() },
      showWindow: vi.fn(),
      hideWindow: vi.fn(),
      tray: {
        isDestroyed: vi.fn(() => false),
        setContextMenu: vi.fn(),
      },
    } as unknown as Menubar;
    menuBuilder = new MenuBuilder(menubar);
  });

  describe('checkForUpdatesMenuItem', () => {
    it('default menu configuration', () => {
      const config = getMenuItemConfigByLabel('Check for updates');

      expect(config).toBeDefined();
      expect(config?.label).toBe('Check for updates');
      expect(config?.enabled).toBe(true);
      expect(config?.click).toEqual(expect.any(Function));
    });

    it('should enable menu item', () => {
      menuBuilder.setCheckForUpdatesMenuEnabled(true);

      // oxlint-disable-next-line dot-notation -- This is a test
      expect(menuBuilder['checkForUpdatesMenuItem'].enabled).toBe(true);
    });

    it('should disable menu item', () => {
      menuBuilder.setCheckForUpdatesMenuEnabled(false);

      // oxlint-disable-next-line dot-notation -- This is a test
      expect(menuBuilder['checkForUpdatesMenuItem'].enabled).toBe(false);
    });
  });

  describe('noUpdateAvailableMenuItem', () => {
    it('default menu configuration', () => {
      const config = getMenuItemConfigByLabel('No updates available');

      expect(config).toBeDefined();
      expect(config?.label).toBe('No updates available');
      expect(config?.enabled).toBe(false);
      expect(config?.visible).toBe(false);
    });

    it('should show menu item', () => {
      menuBuilder.setNoUpdateAvailableMenuVisibility(true);

      // oxlint-disable-next-line dot-notation -- This is a test
      expect(menuBuilder['noUpdateAvailableMenuItem'].visible).toBe(true);
    });

    it('should hide  menu item', () => {
      menuBuilder.setNoUpdateAvailableMenuVisibility(false);

      // oxlint-disable-next-line dot-notation -- This is a test
      expect(menuBuilder['noUpdateAvailableMenuItem'].visible).toBe(false);
    });
  });

  describe('updateAvailableMenuItem', () => {
    it('default menu configuration', () => {
      const config = getMenuItemConfigByLabel('An update is available');

      expect(config).toBeDefined();
      expect(config?.label).toBe('An update is available');
      expect(config?.enabled).toBe(false);
      expect(config?.visible).toBe(false);
    });

    it('should show menu item', () => {
      menuBuilder.setUpdateAvailableMenuVisibility(true);

      // oxlint-disable-next-line dot-notation -- This is a test
      expect(menuBuilder['updateAvailableMenuItem'].visible).toBe(true);
    });

    it('should hide menu item', () => {
      menuBuilder.setUpdateAvailableMenuVisibility(false);

      // oxlint-disable-next-line dot-notation -- This is a test
      expect(menuBuilder['updateAvailableMenuItem'].visible).toBe(false);
    });
  });

  describe('updateReadyForInstallMenuItem', () => {
    it('default menu configuration', () => {
      const config = getMenuItemConfigByLabel('Restart to install update');

      expect(config).toBeDefined();
      expect(config?.label).toBe('Restart to install update');
      expect(config?.enabled).toBe(true);
      expect(config?.visible).toBe(false);
      expect(config?.click).toEqual(expect.any(Function));
    });

    it('should show menu item', () => {
      menuBuilder.setUpdateReadyForInstallMenuVisibility(true);

      // oxlint-disable-next-line dot-notation -- This is a test
      expect(menuBuilder['updateReadyForInstallMenuItem'].visible).toBe(true);
    });

    it('should hide menu item', () => {
      menuBuilder.setUpdateReadyForInstallMenuVisibility(false);

      // oxlint-disable-next-line dot-notation -- This is a test
      expect(menuBuilder['updateReadyForInstallMenuItem'].visible).toBe(false);
    });
  });

  describe('windowVisibilityMenuItems', () => {
    it('show item is visible by default; hide item is not', () => {
      const showCfg = getMenuItemConfigByLabel(`Show ${APPLICATION.NAME}`);
      const hideCfg = getMenuItemConfigByLabel(`Hide ${APPLICATION.NAME}`);

      expect(showCfg?.visible).toBe(true);
      expect(hideCfg?.visible).toBe(false);
    });

    it('setWindowVisibility(true) shows hide item, hides show item', () => {
      menuBuilder.setWindowVisibility(true);

      // oxlint-disable-next-line dot-notation -- This is a test
      expect(menuBuilder['showWindowMenuItem'].visible).toBe(false);
      // oxlint-disable-next-line dot-notation -- This is a test
      expect(menuBuilder['hideWindowMenuItem'].visible).toBe(true);
    });

    it('setWindowVisibility(false) shows show item, hides hide item', () => {
      menuBuilder.setWindowVisibility(true);
      menuBuilder.setWindowVisibility(false);

      // oxlint-disable-next-line dot-notation -- This is a test
      expect(menuBuilder['showWindowMenuItem'].visible).toBe(true);
      // oxlint-disable-next-line dot-notation -- This is a test
      expect(menuBuilder['hideWindowMenuItem'].visible).toBe(false);
    });

    it('does not touch the tray on visibility change (library re-publishes on show/hide)', () => {
      menuBuilder.buildMenu();
      menuBuilder.setWindowVisibility(true);

      expect(menubar.tray.setContextMenu).not.toHaveBeenCalled();
    });
  });

  describe('click handlers', () => {
    it('invokes autoUpdater.checkForUpdatesAndNotify when clicking "Check for updates"', () => {
      const cfg = getMenuItemConfigByLabel('Check for updates');
      expect(cfg).toBeDefined();

      cfg?.click?.();

      expect(autoUpdater.checkForUpdatesAndNotify).toHaveBeenCalled();
    });

    it('invokes autoUpdater.quitAndInstall when clicking "Restart to install update"', () => {
      const cfg = getMenuItemConfigByLabel('Restart to install update');
      expect(cfg).toBeDefined();

      cfg?.click?.();

      expect(autoUpdater.quitAndInstall).toHaveBeenCalled();
    });

    it('developer submenu click actions execute expected functions', () => {
      const template = buildAndGetTemplate();
      const devEntry = template.find((item) => item?.label === 'Developer') as TemplateItem;
      expect(devEntry).toBeDefined();
      const submenu = devEntry.submenu ?? [];
      const clickByLabel = (label: string) => submenu.find((i) => i.label === label)?.click?.();

      clickByLabel('Take Screenshot');
      expect(takeScreenshot).toHaveBeenCalledWith(menubar);

      clickByLabel('View Application Logs');
      expect(openLogsDirectory).toHaveBeenCalled();

      clickByLabel('Visit Repository');
      expect(shell.openExternal).toHaveBeenCalledWith(
        `https://github.com/${APPLICATION.REPO_SLUG}`,
      );

      clickByLabel(`Reset ${APPLICATION.NAME}`);
      expect(resetApp).toHaveBeenCalledWith(menubar);
    });

    it('website menu item opens external URL', () => {
      const template = buildAndGetTemplate();
      const item = template.find((i) => i.label === 'Visit Website');
      item?.click?.();
      expect(shell.openExternal).toHaveBeenCalledWith(APPLICATION.WEBSITE);
    });

    it('quit menu item quits the app', () => {
      const template = buildAndGetTemplate();
      const item = template.find((i) => i.label === `Quit ${APPLICATION.NAME}`);

      item?.click?.();

      expect(menubar.app.quit).toHaveBeenCalled();
    });

    it('show window menu item calls showWindow', () => {
      const cfg = getMenuItemConfigByLabel(`Show ${APPLICATION.NAME}`);
      cfg?.click?.();
      expect(menubar.showWindow).toHaveBeenCalled();
    });

    it('hide window menu item calls hideWindow', () => {
      const cfg = getMenuItemConfigByLabel(`Hide ${APPLICATION.NAME}`);
      cfg?.click?.();
      expect(menubar.hideWindow).toHaveBeenCalled();
    });

    it('developer submenu includes expected static accelerators', () => {
      const template = buildAndGetTemplate();
      const devEntry = template.find((item) => item?.label === 'Developer') as TemplateItem;
      const reloadItem = (devEntry.submenu ?? []).find((i) => i.role === 'reload');

      expect(reloadItem?.accelerator).toBe('CommandOrControl+R');
    });
  });

  describe('platform-specific accelerators', () => {
    // We test the accelerator values using the actual menu template
    // The isMacOS function is called during buildMenu, so we can verify the expected behavior
    // by building the menu and inspecting the template

    it('uses mac accelerator for toggleDevTools when on macOS', async () => {
      vi.mocked(isMacOS).mockReturnValue(true);
      menuItemInstances.length = 0;
      (Menu.buildFromTemplate as Mock).mockClear();

      const mb = new MenuBuilder({
        app: { quit: vi.fn() },
      } as unknown as Menubar);
      mb.buildMenu();

      const template = (Menu.buildFromTemplate as Mock).mock.calls.slice(
        -1,
      )[0][0] as TemplateItem[];
      const devEntry = template.find((i) => i?.label === 'Developer') as TemplateItem;
      const toggleItem = devEntry.submenu?.find((i) => i.role === 'toggleDevTools');

      expect(toggleItem?.accelerator).toBe('Alt+Cmd+I');
    });

    it('uses non-mac accelerator for toggleDevTools otherwise', async () => {
      vi.mocked(isMacOS).mockReturnValue(false);
      menuItemInstances.length = 0;
      (Menu.buildFromTemplate as Mock).mockClear();

      const mb = new MenuBuilder({
        app: { quit: vi.fn() },
      } as unknown as Menubar);
      mb.buildMenu();

      const template = (Menu.buildFromTemplate as Mock).mock.calls.slice(
        -1,
      )[0][0] as TemplateItem[];
      const devEntry = template.find((i) => i?.label === 'Developer') as TemplateItem;
      const toggleItem = devEntry.submenu?.find((i) => i.role === 'toggleDevTools');

      expect(toggleItem?.accelerator).toBe('Ctrl+Shift+I');
    });
  });
});
