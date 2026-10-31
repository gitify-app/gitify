/**
 * Store subscriptions that watch for state changes and trigger corresponding side effects.
 *
 * Should be initialized once during app startup within a React useEffect hook
 * to ensure proper lifecycle management and cleanup on unmount.
 */

import { getAccountUUID } from '../utils/auth/utils';
import {
  setAutoLaunch,
  setKeepWindowOnBlur,
  setShowUpdateNotifications,
  setTrayIconAppearance,
  setUseUnreadActiveIcon,
  setUseX11Backend,
} from '../utils/system/comms';
import {
  clampZoomPercentage,
  getNextZoomPercentage,
  zoomLevelToPercentage,
  zoomPercentageToLevel,
} from '../utils/ui/zoom';
import { useAccountsStore, useFiltersStore, useSettingsStore } from './';

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
  setShowUpdateNotifications(useSettingsStore.getState().showUpdateNotifications);
  setUseUnreadActiveIcon(useSettingsStore.getState().useUnreadActiveIcon);
  setTrayIconAppearance(useSettingsStore.getState().trayIconAppearance);

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

  // Automatic update notifications
  const unsubShowUpdateNotifications = useSettingsStore.subscribe(
    (state) => state.showUpdateNotifications,
    (showUpdateNotifications) => {
      setShowUpdateNotifications(showUpdateNotifications);
    },
  );
  unsubscribers.push(unsubShowUpdateNotifications);

  // Linux X11 backend. Not applied on startup: the main process reads its own
  // marker file before the renderer exists, so mirroring it here would be
  // redundant. Only the change needs forwarding.
  const unsubUseX11Backend = useSettingsStore.subscribe(
    (state) => state.useX11Backend,
    (useX11Backend) => {
      setUseX11Backend(useX11Backend);
    },
  );
  unsubscribers.push(unsubUseX11Backend);

  // Tray icon settings (unread active icon)
  const unsubUnreadActive = useSettingsStore.subscribe(
    (state) => state.useUnreadActiveIcon,
    (useUnreadActiveIcon) => {
      setUseUnreadActiveIcon(useUnreadActiveIcon);
    },
  );
  unsubscribers.push(unsubUnreadActive);

  // Idle tray icon appearance
  const unsubAppearance = useSettingsStore.subscribe(
    (state) => state.trayIconAppearance,
    (trayIconAppearance) => {
      setTrayIconAppearance(trayIconAppearance);
    },
  );
  unsubscribers.push(unsubAppearance);

  // Initialize zoom level from saved settings on startup. Persisted settings
  // from older versions may be outside the supported range.
  const storedZoomPercentage = useSettingsStore.getState().zoomPercentage;
  const initialZoomPercentage = clampZoomPercentage(storedZoomPercentage);
  window.gitify.zoom.setLevel(zoomPercentageToLevel(initialZoomPercentage));

  if (initialZoomPercentage !== storedZoomPercentage) {
    useSettingsStore.getState().updateSetting('zoomPercentage', initialZoomPercentage);
  }

  // Zoom percentage changes
  const unsubZoom = useSettingsStore.subscribe(
    (state) => state.zoomPercentage,
    (zoomPercentage) => {
      window.gitify.zoom.setLevel(zoomPercentageToLevel(clampZoomPercentage(zoomPercentage)));
    },
  );
  unsubscribers.push(unsubZoom);

  // Native Cmd/Ctrl +/-/0 shortcuts, routed from the main process so they use
  // the same step and bounds as the Settings controls.
  const unsubZoomShortcut = window.gitify.onZoom((action) => {
    const currentZoomPercentage = useSettingsStore.getState().zoomPercentage;
    const nextZoomPercentage = getNextZoomPercentage(currentZoomPercentage, action);

    if (nextZoomPercentage !== currentZoomPercentage) {
      useSettingsStore.getState().updateSetting('zoomPercentage', nextZoomPercentage);
    }
  });
  unsubscribers.push(unsubZoomShortcut);

  // Set up zoom level sync from window resize
  let timeout: NodeJS.Timeout;
  const DELAY = 200;

  const handleResize = () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      const nativeZoomPercentage = zoomLevelToPercentage(window.gitify.zoom.getLevel());
      const zoomPercentage = clampZoomPercentage(nativeZoomPercentage);

      // Something other than Gitify changed the native zoom (e.g. a menu item
      // or pinch zoom). Snap it back within the supported range.
      if (zoomPercentage !== nativeZoomPercentage) {
        window.gitify.zoom.setLevel(zoomPercentageToLevel(zoomPercentage));
      }

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

  // ========================================================================
  // Accounts Store Side Effects
  // ========================================================================

  // Account filters are keyed by account UUID, which embeds the hostname, user
  // and auth method. Drop any that no longer match an account (logout, or a
  // UUID change such as an auth-method relabel) so they cannot silently hide
  // notifications.
  const pruneAccountFilters = () => {
    useFiltersStore
      .getState()
      .pruneAccounts(useAccountsStore.getState().accounts.map(getAccountUUID));
  };
  pruneAccountFilters();

  const unsubAccounts = useAccountsStore.subscribe((state, prevState) => {
    if (state.accounts !== prevState.accounts) {
      pruneAccountFilters();
    }
  });
  unsubscribers.push(unsubAccounts);

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
