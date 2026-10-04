import { EVENTS } from '../../shared/events';

import { handleMainEvent } from '../events';
import { detectUpdateManager } from '../update-manager';
import { registerUpdaterHandlers } from './updater';

let applyPreferences: (event: unknown, preferences: unknown) => Promise<void>;
vi.mock('../events', () => ({
  handleMainEvent: vi.fn(),
  onMainEvent: vi.fn((_event: string, listener: typeof applyPreferences) => {
    applyPreferences = listener;
  }),
}));
vi.mock('electron', () => ({ app: { getAppPath: () => '/usr/lib/gitify/app.asar' } }));
vi.mock('../update-manager', () => ({ detectUpdateManager: vi.fn() }));
vi.mock('../../shared/logger', () => ({ logError: vi.fn(), toError: (error: unknown) => error }));

const appUpdater = {
  setNotificationsEnabled: vi.fn(),
  setAutomaticUpdatesEnabled: vi.fn().mockResolvedValue(undefined),
};

describe('updater preferences', () => {
  beforeEach(() => {
    vi.mocked(detectUpdateManager).mockResolvedValue(null);
  });

  it.each([
    ['default', null, true],
    ['default', 'pacman', false],
    ['enabled', 'Scoop', true],
    ['disabled', null, false],
  ])('applies %s with manager %s as %s', async (automaticUpdates, manager, enabled) => {
    vi.mocked(detectUpdateManager).mockResolvedValue(manager);
    registerUpdaterHandlers(appUpdater);
    await applyPreferences(null, { automaticUpdates, showUpdateNotifications: false });
    expect(appUpdater.setAutomaticUpdatesEnabled).toHaveBeenCalledWith(enabled);
    expect(appUpdater.setNotificationsEnabled).toHaveBeenCalledWith(false);
    expect(handleMainEvent).toHaveBeenCalledWith(EVENTS.UPDATE_MANAGER, expect.any(Function));
  });

  it('waits for detection and only applies the latest preference', async () => {
    const detection = Promise.withResolvers<string | null>();
    vi.mocked(detectUpdateManager).mockReturnValue(detection.promise);
    registerUpdaterHandlers(appUpdater);
    const first = applyPreferences(null, {
      automaticUpdates: 'default',
      showUpdateNotifications: true,
    });
    const second = applyPreferences(null, {
      automaticUpdates: 'disabled',
      showUpdateNotifications: false,
    });
    expect(appUpdater.setAutomaticUpdatesEnabled).not.toHaveBeenCalled();
    detection.resolve(null);
    await Promise.all([first, second]);
    expect(appUpdater.setAutomaticUpdatesEnabled).toHaveBeenCalledExactlyOnceWith(false);
  });

  it.each([
    null,
    {},
    { automaticUpdates: 'sometimes', showUpdateNotifications: true },
    { automaticUpdates: 'enabled', showUpdateNotifications: 'yes' },
  ])('rejects malformed preferences %j', async (preferences) => {
    registerUpdaterHandlers(appUpdater);
    await applyPreferences(null, preferences);
    expect(appUpdater.setAutomaticUpdatesEnabled).not.toHaveBeenCalled();
  });
});
