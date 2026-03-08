import type { Menubar } from 'menubar';

import { EVENTS } from '../../shared/events';

import { registerSystemHandlers } from './system';

const onMock = vi.fn();

vi.mock('electron', () => ({
  ipcMain: {
    on: (...args: unknown[]) => onMock(...args),
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

    menubar = {
      showWindow: vi.fn(),
      hideWindow: vi.fn(),
      window: {
        isVisible: vi.fn().mockReturnValue(false),
      },
    } as unknown as Menubar;
  });

  describe('registerSystemHandlers', () => {
    it('registers handlers without throwing', () => {
      expect(() => registerSystemHandlers(menubar)).not.toThrow();
    });

    it('registers expected system IPC event handlers', () => {
      registerSystemHandlers(menubar);

      const registeredEvents = onMock.mock.calls.map(
        (call: [string]) => call[0],
      );

      expect(registeredEvents).toContain(EVENTS.OPEN_EXTERNAL);
      expect(registeredEvents).toContain(EVENTS.UPDATE_KEYBOARD_SHORTCUT);
      expect(registeredEvents).toContain(EVENTS.UPDATE_AUTO_LAUNCH);
    });
  });
});
