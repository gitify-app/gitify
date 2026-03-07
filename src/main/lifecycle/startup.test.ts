import type { Menubar } from 'menubar';

import { EVENTS } from '../../shared/events';

import { handleProtocolURL, initializeAppLifecycle } from './startup';

const requestSingleInstanceLockMock = vi.fn(() => true);
const appOnMock = vi.fn();
const appQuitMock = vi.fn();

vi.mock('electron', () => ({
  app: {
    requestSingleInstanceLock: () => requestSingleInstanceLockMock(),
    on: (...a: unknown[]) => appOnMock(...a),
    quit: () => appQuitMock(),
  },
}));

const sendRendererEventMock = vi.fn();
vi.mock('../events', () => ({
  sendRendererEvent: (...a: unknown[]) => sendRendererEventMock(...a),
}));

const logInfoMock = vi.fn();
const logWarnMock = vi.fn();
vi.mock('../../shared/logger', () => ({
  logInfo: (...a: unknown[]) => logInfoMock(...a),
  logWarn: (...a: unknown[]) => logWarnMock(...a),
}));

function createMb() {
  return {
    on: vi.fn(),
    showWindow: vi.fn(),
    app: { setAppUserModelId: vi.fn(), quit: vi.fn() },
    tray: {
      setToolTip: vi.fn(),
      setIgnoreDoubleClickEvents: vi.fn(),
      on: vi.fn(),
      popUpContextMenu: vi.fn(),
    },
  };
}

describe('main/lifecycle/startup.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initializeAppLifecycle', () => {
    it('registers menubar ready handler', () => {
      const mb = createMb();
      const contextMenu = {} as Electron.Menu;
      initializeAppLifecycle(mb as unknown as Menubar, contextMenu, 'gitify');
      expect(mb.on).toHaveBeenCalledWith('ready', expect.any(Function));
    });

    it('quits and warns when second instance detected', () => {
      requestSingleInstanceLockMock.mockReturnValueOnce(false);
      const mb = createMb();
      const contextMenu = {} as Electron.Menu;
      initializeAppLifecycle(mb as unknown as Menubar, contextMenu, 'gitify');
      expect(appQuitMock).toHaveBeenCalled();
      expect(logWarnMock).toHaveBeenCalled();
    });
  });

  describe('handleProtocolURL', () => {
    it('forwards matching protocol URL to renderer as AUTH_CALLBACK', () => {
      const mb = createMb();
      const url = 'gitify://callback?code=abc123';
      handleProtocolURL(mb as unknown as Menubar, url, 'gitify');
      expect(sendRendererEventMock).toHaveBeenCalledWith(
        mb,
        EVENTS.AUTH_CALLBACK,
        url,
      );
    });

    it('ignores URLs that do not match the protocol', () => {
      const mb = createMb();
      handleProtocolURL(
        mb as unknown as Menubar,
        'https://github.com',
        'gitify',
      );
      expect(sendRendererEventMock).not.toHaveBeenCalled();
    });
  });
});
