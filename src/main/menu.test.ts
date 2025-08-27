import { Menu, MenuItem, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import type { Menubar } from 'menubar';

import { APPLICATION } from '../shared/constants';

import MenuBuilder from './menu';
import { openLogsDirectory, resetApp, takeScreenshot } from './utils';

jest.mock('electron', () => {
  const MenuItem = jest
    .fn()
    .mockImplementation((opts: Record<string, unknown>) => opts);
  return {
    Menu: {
      buildFromTemplate: jest.fn(),
    },
    MenuItem,
    shell: { openExternal: jest.fn() },
  };
});

jest.mock('electron-updater', () => ({
  autoUpdater: {
    checkForUpdatesAndNotify: jest.fn(),
    quitAndInstall: jest.fn(),
  },
}));

jest.mock('./utils', () => ({
  takeScreenshot: jest.fn(),
  openLogsDirectory: jest.fn(),
  resetApp: jest.fn(),
}));

describe('main/menu.ts', () => {
  let menubar: Menubar;
  let menuBuilder: MenuBuilder;

  /** Helper: find MenuItem config captured via MenuItem mock by label */
  const getMenuItemConfigByLabel = (label: string) =>
    (MenuItem as unknown as jest.Mock).mock.calls.find(
      ([arg]) => (arg as { label?: string }).label === label,
    )?.[0] as
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
    return (Menu.buildFromTemplate as jest.Mock).mock.calls.slice(
      -1,
    )[0][0] as TemplateItem[];
  };

  beforeEach(() => {
    jest.clearAllMocks();
    menubar = { app: { quit: jest.fn() } } as unknown as Menubar;
    menuBuilder = new MenuBuilder(menubar);
  });

  describe('checkForUpdatesMenuItem', () => {
    it('default menu configuration', () => {
      expect(MenuItem).toHaveBeenCalledWith({
        label: 'Check for updates',
        enabled: true,
        click: expect.any(Function),
      });
    });

    it('should enable menu item', () => {
      menuBuilder.setCheckForUpdatesMenuEnabled(true);
      // biome-ignore lint/complexity/useLiteralKeys: This is a test
      expect(menuBuilder['checkForUpdatesMenuItem'].enabled).toBe(true);
    });

    it('should disable menu item', () => {
      menuBuilder.setCheckForUpdatesMenuEnabled(false);
      // biome-ignore lint/complexity/useLiteralKeys: This is a test
      expect(menuBuilder['checkForUpdatesMenuItem'].enabled).toBe(false);
    });
  });

  describe('noUpdateAvailableMenuItem', () => {
    it('default menu configuration', () => {
      expect(MenuItem).toHaveBeenCalledWith({
        label: 'No updates available',
        enabled: false,
        visible: false,
      });
    });

    it('should show menu item', () => {
      menuBuilder.setNoUpdateAvailableMenuVisibility(true);
      // biome-ignore lint/complexity/useLiteralKeys: This is a test
      expect(menuBuilder['noUpdateAvailableMenuItem'].visible).toBe(true);
    });

    it('should hide  menu item', () => {
      menuBuilder.setNoUpdateAvailableMenuVisibility(false);
      // biome-ignore lint/complexity/useLiteralKeys: This is a test
      expect(menuBuilder['noUpdateAvailableMenuItem'].visible).toBe(false);
    });
  });

  describe('updateAvailableMenuItem', () => {
    it('default menu configuration', () => {
      expect(MenuItem).toHaveBeenCalledWith({
        label: 'An update is available',
        enabled: false,
        visible: false,
      });
    });

    it('should show menu item', () => {
      menuBuilder.setUpdateAvailableMenuVisibility(true);
      // biome-ignore lint/complexity/useLiteralKeys: This is a test
      expect(menuBuilder['updateAvailableMenuItem'].visible).toBe(true);
    });

    it('should hide menu item', () => {
      menuBuilder.setUpdateAvailableMenuVisibility(false);
      // biome-ignore lint/complexity/useLiteralKeys: This is a test
      expect(menuBuilder['updateAvailableMenuItem'].visible).toBe(false);
    });
  });

  describe('updateReadyForInstallMenuItem', () => {
    it('default menu configuration', () => {
      expect(MenuItem).toHaveBeenCalledWith({
        label: 'Restart to install update',
        enabled: true,
        visible: false,
        click: expect.any(Function),
      });
    });

    it('should show menu item', () => {
      menuBuilder.setUpdateReadyForInstallMenuVisibility(true);
      // biome-ignore lint/complexity/useLiteralKeys: This is a test
      expect(menuBuilder['updateReadyForInstallMenuItem'].visible).toBe(true);
    });

    it('should hide menu item', () => {
      menuBuilder.setUpdateReadyForInstallMenuVisibility(false);
      // biome-ignore lint/complexity/useLiteralKeys: This is a test
      expect(menuBuilder['updateReadyForInstallMenuItem'].visible).toBe(false);
    });
  });

  describe('click handlers', () => {
    it('invokes autoUpdater.checkForUpdatesAndNotify when clicking "Check for updates"', () => {
      const cfg = getMenuItemConfigByLabel('Check for updates');
      expect(cfg).toBeDefined();
      cfg.click();
      expect(autoUpdater.checkForUpdatesAndNotify).toHaveBeenCalled();
    });

    it('invokes autoUpdater.quitAndInstall when clicking "Restart to install update"', () => {
      const cfg = getMenuItemConfigByLabel('Restart to install update');
      expect(cfg).toBeDefined();
      cfg.click();
      expect(autoUpdater.quitAndInstall).toHaveBeenCalled();
    });

    it('developer submenu click actions execute expected functions', () => {
      const template = buildAndGetTemplate();
      const devEntry = template.find(
        (item) => item?.label === 'Developer',
      ) as TemplateItem;
      expect(devEntry).toBeDefined();
      const submenu = devEntry.submenu;
      const clickByLabel = (label: string) =>
        submenu.find((i) => i.label === label)?.click?.();

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
      item.click();
      expect(shell.openExternal).toHaveBeenCalledWith(APPLICATION.WEBSITE);
    });

    it('quit menu item quits the app', () => {
      const template = buildAndGetTemplate();
      const item = template.find((i) => i.label === `Quit ${APPLICATION.NAME}`);
      item.click();
      expect(menubar.app.quit).toHaveBeenCalled();
    });

    it('developer submenu includes expected static accelerators', () => {
      const template = buildAndGetTemplate();
      const devEntry = template.find(
        (item) => item?.label === 'Developer',
      ) as TemplateItem;
      const reloadItem = devEntry.submenu.find((i) => i.role === 'reload');
      expect(reloadItem?.accelerator).toBe('CommandOrControl+R');
    });
  });

  describe('platform-specific accelerators', () => {
    // Use isolateModules so we can alter the isMacOS return value before importing MenuBuilder
    const buildTemplateWithPlatform = (isMac: boolean) => {
      jest.isolateModules(() => {
        jest.doMock('../shared/platform', () => ({ isMacOS: () => isMac }));
        // re-mock electron for isolated module context (shared mock factory already defined globally)
        // Clear prior captured calls
        (Menu.buildFromTemplate as jest.Mock).mockClear();
        const MB = require('./menu').default as typeof MenuBuilder;
        const mb = new MB({ app: { quit: jest.fn() } } as unknown as Menubar);
        mb.buildMenu();
      });
      // Return the newest template captured
      return (Menu.buildFromTemplate as jest.Mock).mock.calls.slice(
        -1,
      )[0][0] as TemplateItem[];
    };

    it('uses mac accelerator for toggleDevTools when on macOS', () => {
      const template = buildTemplateWithPlatform(true);
      const devEntry = template.find(
        (i) => i?.label === 'Developer',
      ) as TemplateItem;
      const toggleItem = devEntry.submenu.find(
        (i) => i.role === 'toggleDevTools',
      );
      expect(toggleItem?.accelerator).toBe('Alt+Cmd+I');
    });

    it('uses non-mac accelerator for toggleDevTools otherwise', () => {
      const template = buildTemplateWithPlatform(false);
      const devEntry = template.find(
        (i) => i?.label === 'Developer',
      ) as TemplateItem;
      const toggleItem = devEntry.submenu.find(
        (i) => i.role === 'toggleDevTools',
      );
      expect(toggleItem?.accelerator).toBe('Ctrl+Shift+I');
    });
  });
});
