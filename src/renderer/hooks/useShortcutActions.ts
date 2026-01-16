import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { quitApp } from '../utils/comms';
import { useAppContext } from './useAppContext';

type ShortcutName =
  | 'home'
  | 'focusedMode'
  | 'filters'
  | 'refresh'
  | 'settings'
  | 'quit'
  | 'accounts';

type ShortcutConfig = {
  /** Shortcut key */
  key: string;
  /** If the shortcut key is enabled */
  isAllowed: boolean;
  /** Action the shortcut key should take */
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
        isAllowed: true,
        action: () => navigate('/', { replace: true }),
      },
      focusedMode: {
        key: 'w',
        isAllowed: isLoggedIn && !isLoading,
        action: () => updateSetting('participating', !settings.participating),
      },
      filters: {
        key: 'f',
        isAllowed: isLoggedIn,
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
        isAllowed: !isLoading,
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
        isAllowed: isLoggedIn,
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
        isAllowed: isLoggedIn && isOnSettingsRoute,
        action: () => navigate('/accounts'),
      },
      quit: {
        key: 'q',
        isAllowed: !isLoggedIn || isOnSettingsRoute,
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
