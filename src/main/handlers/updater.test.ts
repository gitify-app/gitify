import { EVENTS } from '../../shared/events';

import type AppUpdater from '../updater';
import { registerUpdaterHandlers } from './updater';

const onMock = vi.fn();

vi.mock('electron', () => ({
  ipcMain: {
    on: (...args: unknown[]) => onMock(...args),
  } satisfies Pick<Electron.IpcMain, 'on'>,
}));

describe('main/handlers/updater.ts', () => {
  let appUpdater: AppUpdater;

  beforeEach(() => {
    appUpdater = { setEnabled: vi.fn() } as unknown as AppUpdater;
  });

  describe('registerUpdaterHandlers', () => {
    it('registers expected updater IPC event handlers', () => {
      registerUpdaterHandlers(appUpdater);

      const registeredEvents = onMock.mock.calls.map((call: unknown[]) => call[0]);

      expect(registeredEvents).toContain(EVENTS.UPDATE_AUTOMATIC_UPDATES);
    });

    it('toggles the updater when the renderer reports the setting', () => {
      registerUpdaterHandlers(appUpdater);

      const listener = onMock.mock.calls.find(
        (call: unknown[]) => call[0] === EVENTS.UPDATE_AUTOMATIC_UPDATES,
      )?.[1] as (event: unknown, enabled: boolean) => void;

      listener(null, false);
      expect(appUpdater.setEnabled).toHaveBeenCalledWith(false);

      listener(null, true);
      expect(appUpdater.setEnabled).toHaveBeenCalledWith(true);
    });
  });
});
