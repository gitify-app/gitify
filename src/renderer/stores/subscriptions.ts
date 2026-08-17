/**
 * Store subscriptions that watch for state changes and trigger corresponding side effects.
 *
 * Should be initialized once during app startup within a React useEffect hook
 * to ensure proper lifecycle management and cleanup on unmount.
 */

import {
  setAutoLaunch,
  setKeepWindowOnBlur,
  setUseAlternateIdleIcon,
  setUseUnreadActiveIcon,
} from '../utils/system/comms';
import { zoomLevelToPercentage, zoomPercentageToLevel } from '../utils/ui/zoom';
import { useSettingsStore } from './';

/**
 * Initialize all store side-effect subscriptions and startup values for main.
 * Should be called once on app initialization within a React useEffect hook.
 *
 * Theme and global keyboard shortcut side effects are handled by the React
 * App context (`App.tsx`) since they require React state.
 *
 * @returns Cleanup function to unsubscribe all listeners
 */
export function initializeStoreSubscriptions(): () => void {
  const unsubscribers: Array<() => void> = [];

  // ========================================================================
  // Startup Initialization
  // ========================================================================
  setAutoLaunch(useSettingsStore.getState().openAtStartup);
  setKeepWindowOnBlur(useSettingsStore.getState().keepWindowOnBlur);
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

  // Keep window open when it loses focus
  const unsubKeepWindowOnBlur = useSettingsStore.subscribe(
    (state) => state.keepWindowOnBlur,
    (keepWindowOnBlur) => {
      setKeepWindowOnBlur(keepWindowOnBlur);
    },
  );
  unsubscribers.push(unsubKeepWindowOnBlur);

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
      const zoomPercentage = zoomLevelToPercentage(window.gitify.zoom.getLevel());
      const currentZoomPercentage = useSettingsStore.getState().zoomPercentage;

      if (zoomPercentage !== currentZoomPercentage) {
        useSettingsStore.getState().updateSetting('zoomPercentage', zoomPercentage);
      }
    }, DELAY);
  };

  window.addEventListener('resize', handleResize);
  unsubscribers.push(() => {
    window.removeEventListener('resize', handleResize);
    clearTimeout(timeout);
  });

  // Filter changes need no subscription here: the notifications query caches
  // unfiltered data and useNotifications recreates its `select` whenever the
  // filters store changes, so filtering is applied instantly without refetching.

  // Return cleanup function that unsubscribes all listeners
  return () => {
    for (const unsubscribe of unsubscribers) {
      unsubscribe();
    }
  };
}
