import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAppContext } from '../context/App';
import { quitApp } from '../utils/comms';

export type ShortcutName =
  | 'home'
  | 'refresh'
  | 'settings'
  | 'filters'
  | 'focusedMode'
  | 'quit'
  | 'accounts';

type ShortcutActions = Record<ShortcutName, () => void>;
type ShortcutEnabled = Record<ShortcutName, boolean>;
type ShortcutHotkeys = Record<ShortcutName, string>;

/**
 * Centralized shortcut actions + enabled state + hotkeys.
 * Used by both the global shortcuts component and UI buttons to avoid duplication.
 */
export function useShortcutActions(): {
  actions: ShortcutActions;
  enabled: ShortcutEnabled;
  hotkeys: ShortcutHotkeys;
} {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    fetchNotifications,
    isLoggedIn,
    isLoadingState,
    settings,
    updateSetting,
  } = useAppContext();

  const isOnFiltersRoute = location.pathname.startsWith('/filters');
  const isOnSettingsRoute = location.pathname.startsWith('/settings');

  const actions: ShortcutActions = useMemo(() => {
    return {
      home: () => navigate('/', { replace: true }),
      focusedMode: () =>
        updateSetting('participating', !settings.participating),
      filters: () => {
        if (isOnFiltersRoute) {
          navigate('/', { replace: true });
        } else {
          navigate('/filters');
        }
      },
      refresh: () => {
        if (isLoadingState) {
          return;
        }
        navigate('/', { replace: true });
        void fetchNotifications();
      },
      settings: () => {
        if (isOnSettingsRoute) {
          navigate('/', { replace: true });
          void fetchNotifications();
        } else {
          navigate('/settings');
        }
      },
      accounts: () => navigate('/accounts'),
      quit: () => quitApp(),
    };
  }, [
    settings.participating,
    isLoadingState,
    isOnSettingsRoute,
    isOnFiltersRoute,
    fetchNotifications,
    updateSetting,
  ]);

  const enabled: ShortcutEnabled = useMemo(() => {
    return {
      home: true,
      focusedMode: !isLoadingState,
      filters: isLoggedIn,
      refresh: !isLoadingState,
      settings: isLoggedIn,
      accounts: isLoggedIn && isOnSettingsRoute,
      quit: !isLoggedIn || isOnSettingsRoute,
    };
  }, [isLoggedIn, isOnSettingsRoute, isLoadingState]);

  const hotkeys: ShortcutHotkeys = {
    home: 'h',
    focusedMode: 'w',
    filters: 'f',
    refresh: 'r',
    settings: 's',
    accounts: 'a',
    quit: 'q',
  };

  return { actions, enabled, hotkeys };
}
