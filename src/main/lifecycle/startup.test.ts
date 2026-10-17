import type { Menubar } from 'electron-menubar';

import { initializeAppLifecycle } from './startup';

const requestSingleInstanceLockMock = vi.fn(() => true);
const appQuitMock = vi.fn();

vi.mock('electron', () => ({
  app: {
    requestSingleInstanceLock: () => requestSingleInstanceLockMock(),
    quit: () => appQuitMock(),
  } satisfies Pick<Electron.App, 'requestSingleInstanceLock' | 'quit'>,
}));

const logWarnMock = vi.fn();
vi.mock('../../shared/logger', () => ({
  logWarn: (...a: unknown[]) => logWarnMock(...a),
}));

function createMb() {
  return {
    on: vi.fn(),
    showWindow: vi.fn(),
    setContextMenu: vi.fn(),
    app: { setAppUserModelId: vi.fn(), quit: vi.fn() },
    tray: {
      setToolTip: vi.fn(),
    },
  };
}

describe('main/lifecycle/startup.ts', () => {
  describe('initializeAppLifecycle', () => {
    it('registers menubar ready handler', () => {
      const mb = createMb();
      const contextMenu = {} as Electron.Menu;

      initializeAppLifecycle(mb as unknown as Menubar, contextMenu);

      expect(mb.on).toHaveBeenCalledWith('ready', expect.any(Function));
    });

    it('quits and warns when second instance detected', () => {
      requestSingleInstanceLockMock.mockReturnValueOnce(false);
      const mb = createMb();
      const contextMenu = {} as Electron.Menu;

      initializeAppLifecycle(mb as unknown as Menubar, contextMenu);

      expect(appQuitMock).toHaveBeenCalled();
      expect(logWarnMock).toHaveBeenCalled();
    });

    it('delegates context-menu wiring to mb.setContextMenu', () => {
      const mb = createMb();
      const contextMenu = {} as Electron.Menu;

      initializeAppLifecycle(mb as unknown as Menubar, contextMenu);

      const readyHandler = (mb.on as unknown as ReturnType<typeof vi.fn>).mock.calls[0]?.[1];
      expect(readyHandler).toBeDefined();
      readyHandler?.();

      expect(mb.setContextMenu).toHaveBeenCalledWith(contextMenu);
    });
  });
});
