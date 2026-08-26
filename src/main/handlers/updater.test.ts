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
    appUpdater = {
      setNotificationsEnabled: vi.fn(),
      start: vi.fn().mockResolvedValue(undefined),
    } as unknown as AppUpdater;
  });

  it('registers the update notification preference handler', () => {
    registerUpdaterHandlers(appUpdater);

    expect(onMock.mock.calls.map((call: unknown[]) => call[0])).toContain(
      EVENTS.UPDATE_SHOW_UPDATE_NOTIFICATIONS,
    );
  });

  it.each([false, true])('applies the preference and starts update checks for %s', (enabled) => {
    registerUpdaterHandlers(appUpdater);

    const listener = onMock.mock.calls.find(
      (call: unknown[]) => call[0] === EVENTS.UPDATE_SHOW_UPDATE_NOTIFICATIONS,
    )?.[1] as (event: unknown, enabled: boolean) => void;

    listener(null, enabled);

    expect(appUpdater.setNotificationsEnabled).toHaveBeenCalledWith(enabled);
    expect(appUpdater.start).toHaveBeenCalledTimes(1);
  });
});
