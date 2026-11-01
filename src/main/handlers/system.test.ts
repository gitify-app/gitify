import { app, nativeTheme } from 'electron';
import type { Menubar } from 'electron-menubar';

import { EVENTS } from '../../shared/events';
import { isMacOS, isWindows } from '../../shared/platform';

import { applyKeepWindowOnBlur } from '../lifecycle/window';
import { setX11Backend } from '../ozone';
import { registerSystemHandlers } from './system';

vi.mock('../ozone', () => ({
  setX11Backend: vi.fn(),
}));

vi.mock('../lifecycle/window', () => ({
  applyKeepWindowOnBlur: vi.fn(),
}));

vi.mock('../../shared/logger', () => ({
  logInfo: vi.fn(),
}));

vi.mock('../../shared/platform', () => ({
  isLinux: vi.fn(() => false),
  isMacOS: vi.fn(() => true),
  isWindows: vi.fn(() => false),
}));

const onMock = vi.fn();
const handleMock = vi.fn();

vi.mock('electron', () => ({
  ipcMain: {
    on: (...args: unknown[]) => onMock(...args),
    handle: (...args: unknown[]) => handleMock(...args),
  } satisfies Pick<Electron.IpcMain, 'on' | 'handle'>,
  app: {
    isPackaged: true,
    setLoginItemSettings: vi.fn(),
    getLoginItemSettings: vi.fn(),
  } satisfies Pick<Electron.App, 'isPackaged' | 'setLoginItemSettings' | 'getLoginItemSettings'>,
  shell: {
    openExternal: vi.fn(),
  } satisfies Pick<Electron.Shell, 'openExternal'>,
  powerMonitor: {
    on: vi.fn(),
  } satisfies Pick<Electron.PowerMonitor, 'on'>,
  nativeTheme: {
    themeSource: 'system',
  } satisfies Pick<Electron.NativeTheme, 'themeSource'>,
}));

describe('main/handlers/system.ts', () => {
  let menubar: Menubar;
  let setGlobalShortcutMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    setGlobalShortcutMock = vi.fn().mockReturnValue(true);
    vi.mocked(isMacOS).mockReturnValue(true);
    vi.mocked(isWindows).mockReturnValue(false);

    menubar = {
      showWindow: vi.fn(),
      hideWindow: vi.fn(),
      setGlobalShortcut: setGlobalShortcutMock,
      window: {
        isVisible: vi.fn().mockReturnValue(false),
        webContents: {
          send: vi.fn(),
        },
      },
    } as unknown as Menubar;
  });

  function getKeyboardShortcutHandler() {
    registerSystemHandlers(menubar);
    const handleCall = handleMock.mock.calls.find((c) => c[0] === EVENTS.UPDATE_KEYBOARD_SHORTCUT);
    if (!handleCall) {
      throw new Error('UPDATE_KEYBOARD_SHORTCUT handler not registered');
    }
    return handleCall[1] as (
      event: Electron.IpcMainInvokeEvent,
      data: { enabled: boolean; keyboardShortcut: string },
    ) => { success: boolean };
  }

  describe('registerSystemHandlers', () => {
    it('registers handlers without throwing', () => {
      expect(() => registerSystemHandlers(menubar)).not.toThrow();
    });

    it('registers expected system IPC event handlers', () => {
      registerSystemHandlers(menubar);

      const onEvents = onMock.mock.calls.map((call: unknown[]) => call[0]);
      const handleEvents = handleMock.mock.calls.map((call: unknown[]) => call[0]);

      expect(onEvents).toContain(EVENTS.OPEN_EXTERNAL);
      expect(onEvents).toContain(EVENTS.UPDATE_AUTO_LAUNCH);
      expect(onEvents).toContain(EVENTS.UPDATE_KEEP_WINDOW_ON_BLUR);
      expect(handleEvents).toContain(EVENTS.UPDATE_KEYBOARD_SHORTCUT);
    });
  });

  describe('SYSTEM_WAKE', () => {
    it('registers powerMonitor listeners for resume and unlock-screen', async () => {
      const { powerMonitor } = await import('electron');
      registerSystemHandlers(menubar);

      const registeredEvents = vi
        .mocked(powerMonitor.on)
        .mock.calls.map((call) => call[0] as string);

      expect(registeredEvents).toContain('resume');
      expect(registeredEvents).toContain('unlock-screen');
    });

    it('both powerMonitor events send a SYSTEM_WAKE renderer event', async () => {
      const { powerMonitor } = await import('electron');
      registerSystemHandlers(menubar);

      const calls = vi.mocked(powerMonitor.on).mock.calls as unknown as Array<[string, () => void]>;
      const resumeHandler = calls.find((c) => c[0] === 'resume')?.[1];
      const unlockHandler = calls.find((c) => c[0] === 'unlock-screen')?.[1];
      const webContentsSend = (
        menubar.window as unknown as { webContents: { send: ReturnType<typeof vi.fn> } }
      ).webContents.send;

      resumeHandler?.();
      expect(webContentsSend).toHaveBeenCalledWith(EVENTS.SYSTEM_WAKE);

      webContentsSend.mockClear();
      unlockHandler?.();
      expect(webContentsSend).toHaveBeenCalledWith(EVENTS.SYSTEM_WAKE);
    });

    it('invoking the wake handler sends SYSTEM_WAKE to the renderer', async () => {
      const { powerMonitor } = await import('electron');
      registerSystemHandlers(menubar);

      const calls = vi.mocked(powerMonitor.on).mock.calls as unknown as Array<[string, () => void]>;
      const resumeHandler = calls.find((c) => c[0] === 'resume')?.[1];
      resumeHandler?.();

      expect(
        (menubar.window as unknown as { webContents: { send: ReturnType<typeof vi.fn> } })
          .webContents.send,
      ).toHaveBeenCalledWith(EVENTS.SYSTEM_WAKE);
    });
  });

  describe('GET_LOGIN_ITEM_SETTINGS', () => {
    function getLoginItemHandler() {
      registerSystemHandlers(menubar);
      return handleMock.mock.calls.find(
        (call: unknown[]) => call[0] === EVENTS.GET_LOGIN_ITEM_SETTINGS,
      )?.[1] as () => {
        openAtLogin: boolean;
        status?: string;
        executableWillLaunchAtLogin?: boolean;
      };
    }

    it.each(['not-registered', 'enabled', 'requires-approval', 'not-found'] as const)(
      'reports the macOS status %s',
      (status) => {
        vi.mocked(app.getLoginItemSettings).mockReturnValue({
          openAtLogin: true,
          status,
        } as Electron.LoginItemSettings);

        expect(getLoginItemHandler()()).toEqual({ openAtLogin: true, status });
      },
    );

    it('reports the Windows launch state', () => {
      vi.mocked(isMacOS).mockReturnValue(false);
      vi.mocked(isWindows).mockReturnValue(true);
      vi.mocked(app.getLoginItemSettings).mockReturnValue({
        openAtLogin: true,
        executableWillLaunchAtLogin: false,
      } as Electron.LoginItemSettings);

      expect(getLoginItemHandler()()).toEqual({
        openAtLogin: true,
        executableWillLaunchAtLogin: false,
      });
    });

    it('skips the read in development', () => {
      const mutableApp = app as unknown as { isPackaged: boolean };
      const original = mutableApp.isPackaged;
      mutableApp.isPackaged = false;

      try {
        expect(getLoginItemHandler()()).toEqual({ openAtLogin: false });
        expect(app.getLoginItemSettings).not.toHaveBeenCalled();
      } finally {
        mutableApp.isPackaged = original;
      }
    });

    it('skips the read on platforms without a login item', () => {
      vi.mocked(isMacOS).mockReturnValue(false);
      vi.mocked(isWindows).mockReturnValue(false);

      expect(getLoginItemHandler()()).toEqual({ openAtLogin: false });
      expect(app.getLoginItemSettings).not.toHaveBeenCalled();
    });
  });

  describe('SET_NATIVE_THEME', () => {
    it('syncs nativeTheme.themeSource with the requested source', () => {
      registerSystemHandlers(menubar);

      const handler = handleMock.mock.calls.find(
        (call: unknown[]) => call[0] === EVENTS.SET_NATIVE_THEME,
      )?.[1];
      handler?.({}, 'dark');

      expect(nativeTheme.themeSource).toBe('dark');
    });
  });

  describe('UPDATE_KEEP_WINDOW_ON_BLUR', () => {
    it('forwards the value to applyKeepWindowOnBlur', () => {
      registerSystemHandlers(menubar);

      const handler = onMock.mock.calls.find(
        (call: unknown[]) => call[0] === EVENTS.UPDATE_KEEP_WINDOW_ON_BLUR,
      )?.[1];
      handler?.({}, true);

      expect(applyKeepWindowOnBlur).toHaveBeenCalledWith(menubar, true);
    });
  });

  describe('UPDATE_USE_X11_BACKEND', () => {
    it('forwards the value to setX11Backend', () => {
      registerSystemHandlers(menubar);

      const handler = onMock.mock.calls.find(
        (call: unknown[]) => call[0] === EVENTS.UPDATE_USE_X11_BACKEND,
      )?.[1];
      handler?.({}, true);

      expect(setX11Backend).toHaveBeenCalledWith(true);
    });
  });

  describe('UPDATE_KEYBOARD_SHORTCUT', () => {
    it('delegates registration to mb.setGlobalShortcut when enabled', () => {
      const handler = getKeyboardShortcutHandler();

      const result = handler({} as Electron.IpcMainInvokeEvent, {
        enabled: true,
        keyboardShortcut: 'CommandOrControl+Shift+G',
      });

      expect(result).toEqual({ success: true });
      expect(setGlobalShortcutMock).toHaveBeenCalledWith('CommandOrControl+Shift+G');
    });

    it('clears the shortcut when disabled', () => {
      const handler = getKeyboardShortcutHandler();

      handler({} as Electron.IpcMainInvokeEvent, {
        enabled: true,
        keyboardShortcut: 'CommandOrControl+Shift+A',
      });
      setGlobalShortcutMock.mockClear();

      const result = handler({} as Electron.IpcMainInvokeEvent, {
        enabled: false,
        keyboardShortcut: 'CommandOrControl+Shift+A',
      });

      expect(result).toEqual({ success: true });
      expect(setGlobalShortcutMock).toHaveBeenCalledWith(undefined);
    });

    it('returns success false and rolls back to the previous shortcut when the new registration fails', () => {
      const handler = getKeyboardShortcutHandler();

      handler({} as Electron.IpcMainInvokeEvent, {
        enabled: true,
        keyboardShortcut: 'CommandOrControl+Shift+A',
      });
      setGlobalShortcutMock.mockClear();
      setGlobalShortcutMock.mockReturnValueOnce(false).mockReturnValue(true);

      const result = handler({} as Electron.IpcMainInvokeEvent, {
        enabled: true,
        keyboardShortcut: 'CommandOrControl+Shift+B',
      });

      expect(result).toEqual({ success: false });
      expect(setGlobalShortcutMock).toHaveBeenNthCalledWith(1, 'CommandOrControl+Shift+B');
      expect(setGlobalShortcutMock).toHaveBeenNthCalledWith(2, 'CommandOrControl+Shift+A');
    });
  });
});
