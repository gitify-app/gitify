import type { Menubar } from 'electron-menubar';

import { EVENTS } from '../../shared/events';

import { applyKeepWindowOnBlur } from '../lifecycle/window';
import { registerSystemHandlers } from './system';

vi.mock('../lifecycle/window', () => ({
  applyKeepWindowOnBlur: vi.fn(),
}));

vi.mock('../../shared/logger', () => ({
  logInfo: vi.fn(),
}));

const onMock = vi.fn();
const handleMock = vi.fn();

vi.mock('electron', () => ({
  ipcMain: {
    on: (...args: unknown[]) => onMock(...args),
    handle: (...args: unknown[]) => handleMock(...args),
  } satisfies Pick<Electron.IpcMain, 'on' | 'handle'>,
  app: {
    setLoginItemSettings: vi.fn(),
  } satisfies Pick<Electron.App, 'setLoginItemSettings'>,
  shell: {
    openExternal: vi.fn(),
  } satisfies Pick<Electron.Shell, 'openExternal'>,
  powerMonitor: {
    on: vi.fn(),
  } satisfies Pick<Electron.PowerMonitor, 'on'>,
}));

describe('main/handlers/system.ts', () => {
  let menubar: Menubar;
  let setGlobalShortcutMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    setGlobalShortcutMock = vi.fn().mockReturnValue(true);

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
