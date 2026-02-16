import { dialog } from 'electron';
import type { Menubar } from 'menubar';

import { APPLICATION } from '../shared/constants';
import { logError, logInfo } from '../shared/logger';

vi.mock('../shared/logger', () => ({
  logInfo: vi.fn(),
  logError: vi.fn(),
}));

import MenuBuilder from './menu';
import AppUpdater from './updater';

// Mock electron-updater with an EventEmitter-like interface
type UpdateDownloadedEvent = { releaseName: string };
type ListenerArgs = UpdateDownloadedEvent | object | undefined;
type Listener = (arg: ListenerArgs) => void;
type ListenerMap = Record<string, Listener[]>;
const listeners: ListenerMap = {};

vi.mock('electron-updater', () => ({
  autoUpdater: {
    on: vi.fn((event: string, cb: Listener) => {
      if (!listeners[event]) {
        listeners[event] = [];
      }
      listeners[event].push(cb);
      return this;
    }),
    checkForUpdatesAndNotify: vi.fn().mockResolvedValue(undefined),
    quitAndInstall: vi.fn(),
  },
}));

// Mock electron (dialog + basic Menu API used by MenuBuilder constructor)
vi.mock('electron', () => {
  class MenuItem {
    constructor(opts: unknown) {
      Object.assign(this, opts);
    }
  }
  return {
    dialog: { showMessageBox: vi.fn() },
    MenuItem,
    Menu: { buildFromTemplate: vi.fn() },
    shell: { openExternal: vi.fn() },
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
    public setCheckForUpdatesMenuEnabled = vi.fn();
    public setNoUpdateAvailableMenuVisibility = vi.fn();
    public setUpdateAvailableMenuVisibility = vi.fn();
    public setUpdateReadyForInstallMenuVisibility = vi.fn();
  }

  let menuBuilder: TestMenuBuilder;
  let updater: AppUpdater;

  beforeEach(() => {
    vi.clearAllMocks();
    for (const k of Object.keys(listeners)) {
      delete listeners[k];
    }

    menubar = {
      app: {
        isPackaged: true,
        // updater.initialize is now only called after app is ready externally
        on: vi.fn(),
      },
      tray: { setToolTip: vi.fn() },
    } as unknown as Menubar;

    menuBuilder = new TestMenuBuilder(menubar);
    updater = new AppUpdater(menubar, menuBuilder);
  });

  describe('update available dialog', () => {
    it('shows dialog with expected message and does NOT install when user chooses Later', async () => {
      vi.mocked(dialog.showMessageBox).mockResolvedValue({
        response: 1, // "Later" button index
        checkboxChecked: false,
      });

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
      vi.mocked(dialog.showMessageBox).mockResolvedValue({
        response: 0, // "Restart" button index
        checkboxChecked: false,
      });

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

    it('auto-hides "No updates available" after configured timeout', async () => {
      vi.useFakeTimers();
      try {
        await updater.start();

        menuBuilder.setNoUpdateAvailableMenuVisibility.mockClear();

        emit('update-not-available');
        // Immediately shows the message
        expect(
          menuBuilder.setNoUpdateAvailableMenuVisibility,
        ).toHaveBeenCalledWith(true);

        // Then hides it after the configured timeout
        vi.advanceTimersByTime(APPLICATION.UPDATE_NOT_AVAILABLE_DISPLAY_MS);
        expect(
          menuBuilder.setNoUpdateAvailableMenuVisibility,
        ).toHaveBeenLastCalledWith(false);
      } finally {
        vi.useRealTimers();
      }
    });

    it('clears pending hide timer when a new check starts', async () => {
      vi.useFakeTimers();
      try {
        await updater.start();
        menuBuilder.setNoUpdateAvailableMenuVisibility.mockClear();

        emit('update-not-available');
        // Message shown
        expect(
          menuBuilder.setNoUpdateAvailableMenuVisibility,
        ).toHaveBeenCalledWith(true);

        // New check should hide immediately and clear pending timeout
        emit('checking-for-update');
        expect(
          menuBuilder.setNoUpdateAvailableMenuVisibility,
        ).toHaveBeenLastCalledWith(false);

        const callsBefore =
          menuBuilder.setNoUpdateAvailableMenuVisibility.mock.calls.length;
        vi.advanceTimersByTime(APPLICATION.UPDATE_NOT_AVAILABLE_DISPLAY_MS * 2);
        // No additional hide call due to cleared timeout
        expect(
          menuBuilder.setNoUpdateAvailableMenuVisibility.mock.calls.length,
        ).toBe(callsBefore);
      } finally {
        vi.useRealTimers();
      }
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
      const originalSetInterval = globalThis.setInterval;
      const setIntervalSpy = vi
        .spyOn(globalThis, 'setInterval')
        .mockImplementation(((fn: () => void) => {
          fn();
          return 0 as unknown as NodeJS.Timeout;
        }) as unknown as typeof setInterval);
      try {
        await updater.start();
        // initial + immediate scheduled invocation
        expect(
          vi.mocked(autoUpdater.checkForUpdatesAndNotify).mock.calls.length,
        ).toBe(2);
        expect(setIntervalSpy).toHaveBeenCalledWith(
          expect.any(Function),
          APPLICATION.UPDATE_CHECK_INTERVAL_MS,
        );
      } finally {
        setIntervalSpy.mockRestore();
        globalThis.setInterval = originalSetInterval;
      }
    });
  });
});
