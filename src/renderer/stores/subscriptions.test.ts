import type { Percentage } from '../types';

import { queryClient } from '../utils/api/queryClient';
import * as comms from '../utils/system/comms';
import * as zoom from '../utils/ui/zoom';
import { initializeStoreSubscriptions } from './subscriptions';
import useFiltersStore from './useFiltersStore';
import useSettingsStore from './useSettingsStore';

describe('renderer/stores/subscriptions.ts', () => {
  const setAutoLaunchSpy = vi.spyOn(comms, 'setAutoLaunch').mockImplementation(vi.fn());
  const setKeepWindowOnBlurSpy = vi.spyOn(comms, 'setKeepWindowOnBlur').mockImplementation(vi.fn());
  const setUseUnreadActiveIconSpy = vi
    .spyOn(comms, 'setUseUnreadActiveIcon')
    .mockImplementation(vi.fn());
  const setUseAlternateIdleIconSpy = vi
    .spyOn(comms, 'setUseAlternateIdleIcon')
    .mockImplementation(vi.fn());
  const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

  let cleanup: (() => void) | null = null;

  afterEach(() => {
    cleanup?.();
    cleanup = null;
  });

  it('applies startup values on initialization', () => {
    cleanup = initializeStoreSubscriptions();

    expect(setAutoLaunchSpy).toHaveBeenCalledWith(useSettingsStore.getState().openAtStartup);
    expect(setKeepWindowOnBlurSpy).toHaveBeenCalledWith(
      useSettingsStore.getState().keepWindowOnBlur,
    );
    expect(setUseUnreadActiveIconSpy).toHaveBeenCalledWith(
      useSettingsStore.getState().useUnreadActiveIcon,
    );
    expect(setUseAlternateIdleIconSpy).toHaveBeenCalledWith(
      useSettingsStore.getState().useAlternateIdleIcon,
    );
    expect(window.gitify.zoom.setLevel).toHaveBeenCalled();
  });

  it('propagates settings changes to the main process', () => {
    cleanup = initializeStoreSubscriptions();
    vi.clearAllMocks();

    useSettingsStore.getState().updateSetting('openAtStartup', true);
    expect(setAutoLaunchSpy).toHaveBeenCalledWith(true);

    useSettingsStore.getState().updateSetting('keepWindowOnBlur', true);
    expect(setKeepWindowOnBlurSpy).toHaveBeenCalledWith(true);

    useSettingsStore.getState().updateSetting('useUnreadActiveIcon', false);
    expect(setUseUnreadActiveIconSpy).toHaveBeenCalledWith(false);

    useSettingsStore.getState().updateSetting('useAlternateIdleIcon', true);
    expect(setUseAlternateIdleIconSpy).toHaveBeenCalledWith(true);
  });

  it('applies zoom level when zoom percentage changes', () => {
    cleanup = initializeStoreSubscriptions();
    vi.clearAllMocks();

    useSettingsStore.getState().updateSetting('zoomPercentage', 120 as Percentage);

    expect(window.gitify.zoom.setLevel).toHaveBeenCalledWith(
      zoom.zoomPercentageToLevel(120 as Percentage),
    );
  });

  it('syncs zoom percentage back into settings on window resize', () => {
    vi.useFakeTimers();
    cleanup = initializeStoreSubscriptions();

    vi.mocked(window.gitify.zoom.getLevel).mockReturnValue(
      zoom.zoomPercentageToLevel(80 as Percentage),
    );

    window.dispatchEvent(new Event('resize'));
    vi.advanceTimersByTime(250);

    expect(useSettingsStore.getState().zoomPercentage).toBe(80);
    vi.useRealTimers();
  });

  it('invalidates the notifications query when filters change', () => {
    cleanup = initializeStoreSubscriptions();
    vi.clearAllMocks();

    useFiltersStore.getState().updateFilter('reasons', 'subscribed', true);

    expect(invalidateQueriesSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['notifications'] }),
    );
  });

  it('stops reacting to changes after cleanup', () => {
    cleanup = initializeStoreSubscriptions();
    cleanup();
    cleanup = null;
    vi.clearAllMocks();

    useSettingsStore.getState().updateSetting('openAtStartup', true);
    window.dispatchEvent(new Event('resize'));

    expect(setAutoLaunchSpy).not.toHaveBeenCalled();
  });
});
