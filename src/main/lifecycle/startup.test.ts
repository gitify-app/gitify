import { EventEmitter } from 'node:events';

import { app } from 'electron';
import type { Menubar } from 'electron-menubar';

import { APPLICATION } from '../../shared/constants';
import { logError, logWarn } from '../../shared/logger';

import { initializeAppLifecycle } from './startup';

vi.mock('electron', async () => {
  const { EventEmitter } = await import('node:events');
  return {
    app: Object.assign(new EventEmitter(), {
      requestSingleInstanceLock: vi.fn(() => true),
      quit: vi.fn(),
    }),
  };
});

vi.mock('../../shared/logger', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../shared/logger')>()),
  logWarn: vi.fn(),
  logError: vi.fn(),
}));

function createMb() {
  return Object.assign(new EventEmitter(), {
    showWindow: vi.fn().mockResolvedValue(undefined),
    setContextMenu: vi.fn(),
    app: { setAppUserModelId: vi.fn() },
    tray: { setToolTip: vi.fn() },
  });
}

describe('main/lifecycle/startup.ts', () => {
  beforeEach(() => {
    app.removeAllListeners();
  });

  it('initializes the tray on ready without showing the window on a normal launch', () => {
    const mb = createMb();
    const contextMenu = {} as Electron.Menu;

    initializeAppLifecycle(mb as unknown as Menubar, contextMenu);
    mb.emit('ready');

    expect(mb.app.setAppUserModelId).toHaveBeenCalledWith(APPLICATION.ID);
    expect(mb.tray.setToolTip).toHaveBeenCalledWith(APPLICATION.NAME);
    expect(mb.setContextMenu).toHaveBeenCalledWith(contextMenu);
    expect(mb.showWindow).not.toHaveBeenCalled();
    expect(app.quit).not.toHaveBeenCalled();
  });

  it('quits the second process without registering a relaunch listener', () => {
    vi.mocked(app.requestSingleInstanceLock).mockReturnValueOnce(false);
    const mb = createMb();

    initializeAppLifecycle(mb as unknown as Menubar, {} as Electron.Menu);
    app.emit('second-instance');
    mb.emit('ready');

    expect(app.quit).toHaveBeenCalledOnce();
    expect(logWarn).toHaveBeenCalledWith('main:gotTheLock', 'Second instance detected, quitting');
    expect(app.listenerCount('second-instance')).toBe(0);
    expect(mb.showWindow).not.toHaveBeenCalled();
  });

  it('shows the existing window on every relaunch instead of toggling it', () => {
    const mb = createMb();
    initializeAppLifecycle(mb as unknown as Menubar, {} as Electron.Menu);
    mb.emit('ready');

    app.emit('second-instance');
    app.emit('second-instance');

    expect(mb.showWindow).toHaveBeenCalledTimes(2);
    expect(app.quit).not.toHaveBeenCalled();
    // macOS activation is already owned by electron-menubar.
    expect(app.listenerCount('activate')).toBe(0);
  });

  it('coalesces early relaunches until the menubar window is ready', () => {
    const mb = createMb();
    initializeAppLifecycle(mb as unknown as Menubar, {} as Electron.Menu);

    app.emit('second-instance');
    app.emit('second-instance');
    expect(mb.showWindow).not.toHaveBeenCalled();

    mb.emit('ready');
    expect(mb.showWindow).toHaveBeenCalledOnce();

    app.emit('second-instance');
    expect(mb.showWindow).toHaveBeenCalledTimes(2);
  });

  it('logs a failed show and allows the next relaunch to retry', async () => {
    const mb = createMb();
    const error = new Error('Window could not be shown');
    mb.showWindow.mockRejectedValueOnce(error);
    initializeAppLifecycle(mb as unknown as Menubar, {} as Electron.Menu);
    mb.emit('ready');

    app.emit('second-instance');
    await vi.waitFor(() =>
      expect(logError).toHaveBeenCalledWith(
        'main:second-instance',
        'Failed to show the existing window',
        error,
      ),
    );

    app.emit('second-instance');
    expect(mb.showWindow).toHaveBeenCalledTimes(2);
  });
});
