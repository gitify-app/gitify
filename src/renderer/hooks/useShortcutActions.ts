import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAppContext } from '../context/App';
import { quitApp } from '../utils/comms';

type ShortcutName =
  | 'home'
  | 'refresh'
  | 'settings'
  | 'filters'
  | 'focusedMode'
  | 'quit'
  | 'accounts';

type ShortcutConfig = {
  key: string;
  enabled: boolean;
  action: () => void;
};

type ShortcutConfigs = Record<ShortcutName, ShortcutConfig>;

/**
 * Centralized shortcut actions + enabled state + hotkeys.
 * Used by both the global shortcuts component and UI buttons to avoid duplication.
 */
export function useShortcutActions(): { shortcuts: ShortcutConfigs } {
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchNotifications, isLoggedIn, status, settings, updateSetting } =
    useAppContext();

  const isOnFiltersRoute = location.pathname.startsWith('/filters');
  const isOnSettingsRoute = location.pathname.startsWith('/settings');
  const isLoading = status === 'loading';

  const shortcuts: ShortcutConfigs = useMemo(() => {
    return {
      home: {
        key: 'h',
        enabled: true,
        action: () => navigate('/', { replace: true }),
      },
      focusedMode: {
        key: 'w',
        enabled: isLoggedIn && !isLoading,
        action: () => updateSetting('participating', !settings.participating),
      },
      filters: {
        key: 'f',
        enabled: isLoggedIn,
        action: () => {
          if (isOnFiltersRoute) {
            navigate('/', { replace: true });
          } else {
            navigate('/filters');
          }
        },
      },
      refresh: {
        key: 'r',
        enabled: !isLoading,
        action: () => {
          if (isLoading) {
            return;
          }
          navigate('/', { replace: true });
          void fetchNotifications();
        },
      },
      settings: {
        key: 's',
        enabled: isLoggedIn,
        action: () => {
          if (isOnSettingsRoute) {
            navigate('/', { replace: true });
            void fetchNotifications();
          } else {
            navigate('/settings');
          }
        },
      },
      accounts: {
        key: 'a',
        enabled: isLoggedIn && isOnSettingsRoute,
        action: () => navigate('/accounts'),
      },
      quit: {
        key: 'q',
        enabled: !isLoggedIn || isOnSettingsRoute,
        action: () => quitApp(),
      },
    };
  }, [
    settings.participating,
    isLoggedIn,
    isLoading,
    isOnFiltersRoute,
    isOnSettingsRoute,
    fetchNotifications,
    updateSetting,
  ]);

  return { shortcuts };
}
