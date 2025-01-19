import { Menu, MenuItem } from 'electron';
import type { Menubar } from 'menubar';
import MenuBuilder from './menu';

jest.mock('electron', () => ({
  Menu: {
    buildFromTemplate: jest.fn(),
  },
  MenuItem: jest.fn(),
}));

describe('main/menu.ts', () => {
  let menubar: Menubar;
  let menuBuilder: MenuBuilder;

  beforeEach(() => {
    menuBuilder = new MenuBuilder(menubar);
  });

  it('should create menu items correctly', () => {
    expect(MenuItem).toHaveBeenCalledWith({
      label: 'Check for updates',
      enabled: true,
      click: expect.any(Function),
    });

    expect(MenuItem).toHaveBeenCalledWith({
      label: 'No updates available',
      enabled: false,
      visible: false,
    });

    expect(MenuItem).toHaveBeenCalledWith({
      label: 'An update is available',
      enabled: false,
      visible: false,
    });

    expect(MenuItem).toHaveBeenCalledWith({
      label: 'Restart to install update',
      enabled: true,
      visible: false,
      click: expect.any(Function),
    });
  });

  it('should build menu correctly', () => {
    menuBuilder.buildMenu();
    expect(Menu.buildFromTemplate).toHaveBeenCalledWith(expect.any(Array));
  });

  it('should enable check for updates menu item', () => {
    menuBuilder.setCheckForUpdatesMenuEnabled(true);
    // biome-ignore lint/complexity/useLiteralKeys: This is a test
    expect(menuBuilder['checkForUpdatesMenuItem'].enabled).toBe(true);
  });

  it('should disable check for updates menu item', () => {
    menuBuilder.setCheckForUpdatesMenuEnabled(false);
    // biome-ignore lint/complexity/useLiteralKeys: This is a test
    expect(menuBuilder['checkForUpdatesMenuItem'].enabled).toBe(false);
  });

  it('should show no update available menu item', () => {
    menuBuilder.setNoUpdateAvailableMenuVisibility(true);
    // biome-ignore lint/complexity/useLiteralKeys: This is a test
    expect(menuBuilder['noUpdateAvailableMenuItem'].visible).toBe(true);
  });

  it('should hide no update available  menu item', () => {
    menuBuilder.setNoUpdateAvailableMenuVisibility(false);
    // biome-ignore lint/complexity/useLiteralKeys: This is a test
    expect(menuBuilder['noUpdateAvailableMenuItem'].visible).toBe(false);
  });

  it('should show update available menu item', () => {
    menuBuilder.setUpdateAvailableMenuVisibility(true);
    // biome-ignore lint/complexity/useLiteralKeys: This is a test
    expect(menuBuilder['updateAvailableMenuItem'].visible).toBe(true);
  });

  it('should hide update available menu item', () => {
    menuBuilder.setUpdateAvailableMenuVisibility(false);
    // biome-ignore lint/complexity/useLiteralKeys: This is a test
    expect(menuBuilder['updateAvailableMenuItem'].visible).toBe(false);
  });

  it('should show update ready for install menu item', () => {
    menuBuilder.setUpdateReadyForInstallMenuVisibility(true);
    // biome-ignore lint/complexity/useLiteralKeys: This is a test
    expect(menuBuilder['updateReadyForInstallMenuItem'].visible).toBe(true);
  });

  it('should show update ready for install menu item', () => {
    menuBuilder.setUpdateReadyForInstallMenuVisibility(false);
    // biome-ignore lint/complexity/useLiteralKeys: This is a test
    expect(menuBuilder['updateReadyForInstallMenuItem'].visible).toBe(false);
  });
});
