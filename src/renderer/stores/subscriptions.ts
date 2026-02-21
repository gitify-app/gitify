/**
 * Store subscriptions that watch for state changes and trigger corresponding side effects.
 *
 * Should be initialized once during app startup within a React useEffect hook
 * to ensure proper lifecycle management and cleanup on unmount.
 */

import { queryClient } from '../utils/api/client';
import { notificationsKeys } from '../utils/api/queryKeys';
import {
  setAutoLaunch,
  setKeyboardShortcut,
  setUseAlternateIdleIcon,
  setUseUnreadActiveIcon,
} from '../utils/comms';
import { zoomLevelToPercentage, zoomPercentageToLevel } from '../utils/zoom';
import { useAccountsStore, useFiltersStore, useSettingsStore } from './';

/**
 * Initialize all store side-effect subscriptions and startup values for main.
 * Should be called once on app initialization within a React useEffect hook.
 *
 * @returns Cleanup function to unsubscribe all listeners
 */
export function initializeStoreSubscriptions(): () => void {
  const unsubscribers: Array<() => void> = [];

  // ========================================================================
  // Startup Initialization
  // ========================================================================
  // Theme initialization is handled by the React App context (`App.tsx`).
  setAutoLaunch(useSettingsStore.getState().openAtStartup);
  setKeyboardShortcut(useSettingsStore.getState().keyboardShortcut);
  setUseUnreadActiveIcon(useSettingsStore.getState().useUnreadActiveIcon);
  setUseAlternateIdleIcon(useSettingsStore.getState().useAlternateIdleIcon);

  // ========================================================================
  // Settings Store Side Effects
  // ========================================================================

  // Auto launch on startup
  const unsubAutoLaunch = useSettingsStore.subscribe(
    (state) => state.openAtStartup,
    (openAtStartup) => {
      setAutoLaunch(openAtStartup);
    },
  );
  unsubscribers.push(unsubAutoLaunch);

  // Keyboard shortcut
  const unsubKeyboard = useSettingsStore.subscribe(
    (state) => state.keyboardShortcut,
    (keyboardShortcut) => {
      setKeyboardShortcut(keyboardShortcut);
    },
  );
  unsubscribers.push(unsubKeyboard);

  // Tray icon settings (unread active icon)
  const unsubUnreadActive = useSettingsStore.subscribe(
    (state) => state.useUnreadActiveIcon,
    (useUnreadActiveIcon) => {
      setUseUnreadActiveIcon(useUnreadActiveIcon);
    },
  );
  unsubscribers.push(unsubUnreadActive);

  // Tray icon settings (alternate idle icon)
  const unsubAlternateIdle = useSettingsStore.subscribe(
    (state) => state.useAlternateIdleIcon,
    (useAlternateIdleIcon) => {
      setUseAlternateIdleIcon(useAlternateIdleIcon);
    },
  );
  unsubscribers.push(unsubAlternateIdle);

  // Initialize zoom level from saved settings on startup
  const initialZoomPercentage = useSettingsStore.getState().zoomPercentage;
  window.gitify.zoom.setLevel(zoomPercentageToLevel(initialZoomPercentage));

  // Zoom percentage changes
  const unsubZoom = useSettingsStore.subscribe(
    (state) => state.zoomPercentage,
    (zoomPercentage) => {
      window.gitify.zoom.setLevel(zoomPercentageToLevel(zoomPercentage));
    },
  );
  unsubscribers.push(unsubZoom);

  // Set up zoom level sync from window resize
  let timeout: NodeJS.Timeout;
  const DELAY = 200;

  const handleResize = () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      const zoomPercentage = zoomLevelToPercentage(
        window.gitify.zoom.getLevel(),
      );
      const currentZoomPercentage = useSettingsStore.getState().zoomPercentage;

      if (zoomPercentage !== currentZoomPercentage) {
        useSettingsStore
          .getState()
          .updateSetting('zoomPercentage', zoomPercentage);
      }
    }, DELAY);
  };

  window.addEventListener('resize', handleResize);
  unsubscribers.push(() => {
    window.removeEventListener('resize', handleResize);
    clearTimeout(timeout);
  });

  // ========================================================================
  // Filters Store Side Effects
  // ========================================================================

  // Subscribe to filters store changes
  const unsubFilters = useFiltersStore.subscribe(() => {
    // Build the query key to match useNotifications
    const accounts = useAccountsStore.getState().accounts;
    const fetchOnlyUnreadNotifications =
      useSettingsStore.getState().fetchReadNotifications;
    const fetchOnlyParticipating = useSettingsStore.getState().participating;

    const queryKey = notificationsKeys.list(
      accounts.length,
      fetchOnlyUnreadNotifications,
      fetchOnlyParticipating,
    );

    // When filters change, invalidate queries to trigger select re-execution
    // The select function in useQuery will reapply filters to cached unfiltered data
    // This happens instantly without API calls
    queryClient.invalidateQueries({ queryKey, refetchType: 'none' });
  });
  unsubscribers.push(unsubFilters);

  // Return cleanup function that unsubscribes all listeners
  return () => {
    for (const unsubscribe of unsubscribers) {
      unsubscribe();
    }
  };
}
