import { dialog } from 'electron';
import type { Menubar } from 'menubar';

import { APPLICATION } from '../shared/constants';
import { logError, logInfo } from '../shared/logger';

jest.mock('../shared/logger', () => ({
  logInfo: jest.fn(),
  logError: jest.fn(),
}));

import MenuBuilder from './menu';
import AppUpdater from './updater';

// Mock electron-updater with an EventEmitter-like interface
type UpdateDownloadedEvent = { releaseName: string };
type ListenerArgs = UpdateDownloadedEvent | object | undefined;
type Listener = (arg: ListenerArgs) => void;
type ListenerMap = Record<string, Listener[]>;
const listeners: ListenerMap = {};

jest.mock('electron-updater', () => ({
  autoUpdater: {
    on: jest.fn((event: string, cb: Listener) => {
      if (!listeners[event]) {
        listeners[event] = [];
      }
      listeners[event].push(cb);
      return this;
    }),
    checkForUpdatesAndNotify: jest.fn().mockResolvedValue(undefined),
    quitAndInstall: jest.fn(),
  },
}));

// Mock electron (dialog + basic Menu API used by MenuBuilder constructor)
jest.mock('electron', () => {
  const MenuItem = jest.fn().mockImplementation((opts: unknown) => opts);
  return {
    dialog: { showMessageBox: jest.fn() },
    MenuItem,
    Menu: { buildFromTemplate: jest.fn() },
    shell: { openExternal: jest.fn() },
  };
});

// Utility to emit mocked autoUpdater events
const emit = (event: string, arg?: ListenerArgs) => {
  (listeners[event] || []).forEach((cb) => {
    cb(arg);
  });
};

// Re-import autoUpdater after mocking
import { autoUpdater } from 'electron-updater';

describe('main/updater.ts', () => {
  let menubar: Menubar;
  class TestMenuBuilder extends MenuBuilder {
    public setCheckForUpdatesMenuEnabled = jest.fn();
    public setNoUpdateAvailableMenuVisibility = jest.fn();
    public setUpdateAvailableMenuVisibility = jest.fn();
    public setUpdateReadyForInstallMenuVisibility = jest.fn();
  }

  let menuBuilder: TestMenuBuilder;
  let updater: AppUpdater;

  beforeEach(() => {
    jest.clearAllMocks();
    for (const k of Object.keys(listeners)) {
      delete listeners[k];
    }

    menubar = {
      app: {
        isPackaged: true,
        // updater.initialize is now only called after app is ready externally
        on: jest.fn(),
      },
      tray: { setToolTip: jest.fn() },
    } as unknown as Menubar;

    menuBuilder = new TestMenuBuilder(menubar);
    updater = new AppUpdater(menubar, menuBuilder);
  });

  describe('update available dialog', () => {
    it('shows dialog with expected message and does NOT install when user chooses Later', async () => {
      (dialog.showMessageBox as jest.Mock).mockResolvedValue({ response: 1 }); // "Later"

      await updater.start();

      // Simulate update downloaded event
      const releaseName = 'v1.2.3';
      emit('update-downloaded', { releaseName });

      expect(dialog.showMessageBox).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining(
            `${APPLICATION.NAME} ${releaseName} has been downloaded`,
          ),
          buttons: ['Restart', 'Later'],
        }),
      );
      expect(autoUpdater.quitAndInstall).not.toHaveBeenCalled();
      // Menu state updates invoked
      expect(menuBuilder.setUpdateAvailableMenuVisibility).toHaveBeenCalledWith(
        false,
      );
      expect(
        menuBuilder.setUpdateReadyForInstallMenuVisibility,
      ).toHaveBeenCalledWith(true);
    });

    it('invokes quitAndInstall when user clicks Restart', async () => {
      (dialog.showMessageBox as jest.Mock).mockResolvedValue({ response: 0 }); // "Restart"

      await updater.start();
      emit('update-downloaded', { releaseName: 'v9.9.9' });
      // Allow then() of showMessageBox promise to resolve
      await Promise.resolve();

      expect(autoUpdater.quitAndInstall).toHaveBeenCalled();
    });
  });

  describe('update event handlers & scheduling', () => {
    it('skips when app is not packaged', async () => {
      Object.defineProperty(menubar.app, 'isPackaged', { value: false });
      await updater.start();
      expect(logInfo).toHaveBeenCalledWith(
        'app updater',
        'Skipping updater since app is in development mode',
      );
      expect(autoUpdater.checkForUpdatesAndNotify).not.toHaveBeenCalled();
    });

    it('handles checking-for-update', async () => {
      await updater.start();
      emit('checking-for-update');
      expect(menuBuilder.setCheckForUpdatesMenuEnabled).toHaveBeenCalledWith(
        false,
      );
      expect(
        menuBuilder.setNoUpdateAvailableMenuVisibility,
      ).toHaveBeenCalledWith(false);
    });

    it('handles update-available', async () => {
      await updater.start();
      emit('update-available');
      expect(menuBuilder.setUpdateAvailableMenuVisibility).toHaveBeenCalledWith(
        true,
      );
      expect(menubar.tray.setToolTip).toHaveBeenCalledWith(
        expect.stringContaining('A new update is available'),
      );
    });

    it('handles download-progress', async () => {
      await updater.start();
      emit('download-progress', { percent: 12.3456 });
      expect(menubar.tray.setToolTip).toHaveBeenCalledWith(
        expect.stringContaining('12.35%'),
      );
    });

    it('handles update-not-available', async () => {
      await updater.start();
      emit('update-not-available');
      expect(menuBuilder.setCheckForUpdatesMenuEnabled).toHaveBeenCalledWith(
        true,
      );
      expect(
        menuBuilder.setNoUpdateAvailableMenuVisibility,
      ).toHaveBeenCalledWith(true);
      expect(menuBuilder.setUpdateAvailableMenuVisibility).toHaveBeenCalledWith(
        false,
      );
      expect(
        menuBuilder.setUpdateReadyForInstallMenuVisibility,
      ).toHaveBeenCalledWith(false);
    });

    it('handles update-cancelled (reset state)', async () => {
      await updater.start();
      emit('update-cancelled');
      expect(menubar.tray.setToolTip).toHaveBeenCalledWith(APPLICATION.NAME);
      expect(menuBuilder.setCheckForUpdatesMenuEnabled).toHaveBeenCalledWith(
        true,
      );
    });

    it('handles error (reset + logError)', async () => {
      await updater.start();
      const err = new Error('failure');
      emit('error', err);
      expect(logError).toHaveBeenCalledWith(
        'auto updater',
        'Error checking for update',
        err,
      );
      expect(menubar.tray.setToolTip).toHaveBeenCalledWith(APPLICATION.NAME);
    });

    it('performs initial check and schedules periodic checks', async () => {
      const originalSetInterval = global.setInterval;
      const setIntervalSpy = jest
        .spyOn(global, 'setInterval')
        .mockImplementation(((fn: () => void) => {
          fn();
          return 0 as unknown as NodeJS.Timer;
        }) as unknown as typeof setInterval);
      try {
        await updater.start();
        // initial + immediate scheduled invocation
        expect(
          (autoUpdater.checkForUpdatesAndNotify as jest.Mock).mock.calls.length,
        ).toBe(2);
        expect(setIntervalSpy).toHaveBeenCalledWith(
          expect.any(Function),
          APPLICATION.UPDATE_CHECK_INTERVAL_MS,
        );
      } finally {
        setIntervalSpy.mockRestore();
        global.setInterval = originalSetInterval;
      }
    });
  });
});
