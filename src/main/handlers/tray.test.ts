import { EventEmitter } from 'node:events';

import { app, nativeTheme } from 'electron';
import type { Menubar } from 'electron-menubar';

import { EVENTS } from '../../shared/events';

import { TrayIcons } from '../icons';
import { registerTrayHandlers } from './tray';

const onMock = vi.fn();

vi.mock('electron', () => ({
  app: new EventEmitter(),
  nativeTheme: Object.assign(new EventEmitter(), {
    shouldUseDarkColorsForSystemIntegratedUI: false,
  }),
  ipcMain: {
    on: (...args: unknown[]) => onMock(...args),
  } satisfies Pick<Electron.IpcMain, 'on'>,
}));

vi.mock('../../shared/platform', () => ({ isMacOS: () => false, isWindows: () => true }));

describe('main/handlers/tray.ts', () => {
  let menubar: Menubar;

  beforeEach(() => {
    vi.clearAllMocks();
    nativeTheme.removeAllListeners();
    app.removeAllListeners();
    Object.assign(nativeTheme, { shouldUseDarkColorsForSystemIntegratedUI: false });
    menubar = {
      tray: {
        isDestroyed: vi.fn().mockReturnValue(false),
        setImage: vi.fn(),
        setTitle: vi.fn(),
      },
    } as unknown as Menubar;
  });

  describe('registerTrayHandlers', () => {
    it('registers handlers without throwing', () => {
      expect(() => registerTrayHandlers(menubar)).not.toThrow();
    });

    it('registers expected tray IPC event handlers', () => {
      registerTrayHandlers(menubar);

      const registeredEvents = onMock.mock.calls.map((call: unknown[]) => call[0]);

      expect(registeredEvents).toContain(EVENTS.SET_TRAY_ICON_APPEARANCE);
      expect(registeredEvents).toContain(EVENTS.USE_UNREAD_ACTIVE_ICON);
      expect(registeredEvents).toContain(EVENTS.UPDATE_ICON_COLOR);
      expect(registeredEvents).toContain(EVENTS.UPDATE_ICON_TITLE);
    });
  });

  it('skips tray updates when tray is destroyed', () => {
    (menubar.tray.isDestroyed as ReturnType<typeof vi.fn>).mockReturnValue(true);
    registerTrayHandlers(menubar);

    const updateColorHandler = onMock.mock.calls.find(
      (call: unknown[]) => call[0] === EVENTS.UPDATE_ICON_COLOR,
    )?.[1];
    updateColorHandler?.({}, { notificationsCount: 5, isOnline: true });

    expect(menubar.tray.setImage).not.toHaveBeenCalled();
  });

  it('sets idle icon when notifications count is 0', () => {
    registerTrayHandlers(menubar);

    const updateColorHandler = onMock.mock.calls.find(
      (call: unknown[]) => call[0] === EVENTS.UPDATE_ICON_COLOR,
    )?.[1];
    updateColorHandler?.({}, { notificationsCount: 0, isOnline: true });

    expect(menubar.tray.setImage).toHaveBeenCalledWith(TrayIcons.dark);
  });

  it('sets active icon when notifications count is positive', () => {
    registerTrayHandlers(menubar);

    const updateColorHandler = onMock.mock.calls.find(
      (call: unknown[]) => call[0] === EVENTS.UPDATE_ICON_COLOR,
    )?.[1];
    updateColorHandler?.({}, { notificationsCount: 3, isOnline: true });

    expect(menubar.tray.setImage).toHaveBeenCalledWith(TrayIcons.active);
  });

  it('sets offline icon when offline', () => {
    registerTrayHandlers(menubar);

    const updateColorHandler = onMock.mock.calls.find(
      (call: unknown[]) => call[0] === EVENTS.UPDATE_ICON_COLOR,
    )?.[1];
    updateColorHandler?.({}, { notificationsCount: 0, isOnline: false });

    expect(menubar.tray.setImage).toHaveBeenCalledWith(TrayIcons.offline);
  });

  it('sets error icon when notifications count is negative', () => {
    registerTrayHandlers(menubar);

    const updateColorHandler = onMock.mock.calls.find(
      (call: unknown[]) => call[0] === EVENTS.UPDATE_ICON_COLOR,
    )?.[1];
    updateColorHandler?.({}, { notificationsCount: -1, isOnline: true });

    expect(menubar.tray.setImage).toHaveBeenCalledWith(TrayIcons.error);
  });

  it('updates tray title', () => {
    registerTrayHandlers(menubar);

    const updateTitleHandler = onMock.mock.calls.find(
      (call: unknown[]) => call[0] === EVENTS.UPDATE_ICON_TITLE,
    )?.[1];
    updateTitleHandler?.({}, '5');

    expect(menubar.tray.setTitle).toHaveBeenCalledWith('5');
  });
  it('updates an idle icon when the system theme changes and honors a manual override', () => {
    registerTrayHandlers(menubar);
    const appearance = onMock.mock.calls.find(
      (call) => call[0] === EVENTS.SET_TRAY_ICON_APPEARANCE,
    )?.[1];
    Object.assign(nativeTheme, { shouldUseDarkColorsForSystemIntegratedUI: true });
    nativeTheme.emit('updated');
    expect(menubar.tray.setImage).toHaveBeenLastCalledWith(TrayIcons.light);
    appearance({}, 'dark');
    expect(menubar.tray.setImage).toHaveBeenLastCalledWith(TrayIcons.dark);
    nativeTheme.emit('updated');
    expect(menubar.tray.setImage).toHaveBeenLastCalledWith(TrayIcons.dark);
    appearance({}, 'auto');
    expect(menubar.tray.setImage).toHaveBeenLastCalledWith(TrayIcons.light);
  });

  it.each([
    [{ notificationsCount: 3, isOnline: true }, TrayIcons.active],
    [{ notificationsCount: -1, isOnline: true }, TrayIcons.error],
    [{ notificationsCount: 0, isOnline: false }, TrayIcons.offline],
  ])('preserves notification state across theme and preference changes: %j', (state, icon) => {
    registerTrayHandlers(menubar);
    onMock.mock.calls.find((call) => call[0] === EVENTS.UPDATE_ICON_COLOR)?.[1]({}, state);
    nativeTheme.emit('updated');
    expect(menubar.tray.setImage).toHaveBeenLastCalledWith(icon);
    onMock.mock.calls.find((call) => call[0] === EVENTS.SET_TRAY_ICON_APPEARANCE)?.[1]({}, 'light');
    expect(menubar.tray.setImage).toHaveBeenLastCalledWith(icon);
  });

  it('applies the idle appearance immediately when unread highlighting is disabled', () => {
    registerTrayHandlers(menubar);
    onMock.mock.calls.find((call) => call[0] === EVENTS.UPDATE_ICON_COLOR)?.[1](
      {},
      { notificationsCount: 3, isOnline: true },
    );
    onMock.mock.calls.find((call) => call[0] === EVENTS.USE_UNREAD_ACTIVE_ICON)?.[1]({}, false);
    expect(menubar.tray.setImage).toHaveBeenLastCalledWith(TrayIcons.dark);
  });

  it('removes the native theme listener on quit', () => {
    registerTrayHandlers(menubar);
    expect(nativeTheme.listenerCount('updated')).toBe(1);
    app.emit('will-quit');
    expect(nativeTheme.listenerCount('updated')).toBe(0);
  });
});
