import { globalShortcut } from 'electron';
import type { Menubar } from 'menubar';

import { EVENTS } from '../../shared/events';

import { registerSystemHandlers } from './system';

const onMock = vi.fn();
const handleMock = vi.fn();

vi.mock('electron', () => ({
  ipcMain: {
    on: (...args: unknown[]) => onMock(...args),
    handle: (...args: unknown[]) => handleMock(...args),
  },
  globalShortcut: {
    register: vi.fn(),
    unregister: vi.fn(),
  },
  app: {
    setLoginItemSettings: vi.fn(),
  },
  shell: {
    openExternal: vi.fn(),
  },
}));

describe('main/handlers/system.ts', () => {
  let menubar: Menubar;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(globalShortcut.register).mockReturnValue(true);

    menubar = {
      showWindow: vi.fn(),
      hideWindow: vi.fn(),
      window: {
        isVisible: vi.fn().mockReturnValue(false),
      },
    } as unknown as Menubar;
  });

  function getKeyboardShortcutHandler() {
    registerSystemHandlers(menubar);
    const handleCall = handleMock.mock.calls.find(
      (c) => c[0] === EVENTS.UPDATE_KEYBOARD_SHORTCUT,
    );
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

      const onEvents = onMock.mock.calls.map((call: [string]) => call[0]);
      const handleEvents = handleMock.mock.calls.map(
        (call: [string]) => call[0],
      );

      expect(onEvents).toContain(EVENTS.OPEN_EXTERNAL);
      expect(onEvents).toContain(EVENTS.UPDATE_AUTO_LAUNCH);
      expect(handleEvents).toContain(EVENTS.UPDATE_KEYBOARD_SHORTCUT);
    });
  });

  describe('UPDATE_KEYBOARD_SHORTCUT', () => {
    it('registers shortcut when enabled', () => {
      const handler = getKeyboardShortcutHandler();

      const result = handler({} as Electron.IpcMainInvokeEvent, {
        enabled: true,
        keyboardShortcut: 'CommandOrControl+Shift+G',
      });

      expect(result).toEqual({ success: true });
      expect(globalShortcut.register).toHaveBeenCalledWith(
        'CommandOrControl+Shift+G',
        expect.any(Function),
      );
    });

    it('unregisters when disabled after being enabled', () => {
      const handler = getKeyboardShortcutHandler();

      handler({} as Electron.IpcMainInvokeEvent, {
        enabled: true,
        keyboardShortcut: 'CommandOrControl+Shift+A',
      });
      vi.clearAllMocks();

      const result = handler({} as Electron.IpcMainInvokeEvent, {
        enabled: false,
        keyboardShortcut: 'CommandOrControl+Shift+A',
      });

      expect(result).toEqual({ success: true });
      expect(globalShortcut.unregister).toHaveBeenCalledWith(
        'CommandOrControl+Shift+A',
      );
      expect(globalShortcut.register).not.toHaveBeenCalled();
    });

    it('unregisters previous shortcut when switching to a new one', () => {
      const handler = getKeyboardShortcutHandler();

      handler({} as Electron.IpcMainInvokeEvent, {
        enabled: true,
        keyboardShortcut: 'CommandOrControl+Shift+A',
      });
      vi.clearAllMocks();

      handler({} as Electron.IpcMainInvokeEvent, {
        enabled: true,
        keyboardShortcut: 'CommandOrControl+Shift+B',
      });

      expect(globalShortcut.unregister).toHaveBeenCalledWith(
        'CommandOrControl+Shift+A',
      );
      expect(globalShortcut.register).toHaveBeenCalledWith(
        'CommandOrControl+Shift+B',
        expect.any(Function),
      );
    });

    it('returns success false and restores previous shortcut when new registration fails', () => {
      const handler = getKeyboardShortcutHandler();

      handler({} as Electron.IpcMainInvokeEvent, {
        enabled: true,
        keyboardShortcut: 'CommandOrControl+Shift+A',
      });
      vi.clearAllMocks();
      vi.mocked(globalShortcut.register)
        .mockReturnValueOnce(false)
        .mockReturnValue(true);

      const result = handler({} as Electron.IpcMainInvokeEvent, {
        enabled: true,
        keyboardShortcut: 'CommandOrControl+Shift+B',
      });

      expect(result).toEqual({ success: false });
      expect(globalShortcut.register).toHaveBeenNthCalledWith(
        1,
        'CommandOrControl+Shift+B',
        expect.any(Function),
      );
      expect(globalShortcut.register).toHaveBeenNthCalledWith(
        2,
        'CommandOrControl+Shift+A',
        expect.any(Function),
      );
    });
  });
});
