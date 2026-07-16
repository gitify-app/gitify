import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAccountsStore, useSettingsStore } from '../stores';

import { quitApp } from '../utils/system/comms';
import { openHostIssues, openHostNotifications, openHostPulls } from '../utils/system/links';
import { useNotifications } from './useNotifications';

type ShortcutName =
  | 'home'
  | 'myNotifications'
  | 'focusedMode'
  | 'filters'
  | 'myIssues'
  | 'myPullRequests'
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

  const { refetchNotifications: fetchNotifications, status } = useNotifications();

  const isLoggedIn = useAccountsStore((s) => s.isLoggedIn());
  const primaryAccountHostname = useAccountsStore((s) => s.primaryAccountHostname());

  const participating = useSettingsStore((s) => s.participating);
  const updateSetting = useSettingsStore((s) => s.updateSetting);

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
      myNotifications: {
        key: 'n',
        isAllowed: isLoggedIn,
        action: () => openHostNotifications(primaryAccountHostname),
      },
      focusedMode: {
        key: 'w',
        isAllowed: isLoggedIn && !isLoading,
        action: () => updateSetting('participating', !participating),
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
      myIssues: {
        key: 'i',
        isAllowed: isLoggedIn,
        action: () => openHostIssues(primaryAccountHostname),
      },
      myPullRequests: {
        key: 'p',
        isAllowed: isLoggedIn,
        action: () => openHostPulls(primaryAccountHostname),
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
    // oxlint-disable-next-line react/exhaustive-deps -- navigate is stable
  }, [
    participating,
    isLoggedIn,
    isLoading,
    isOnFiltersRoute,
    isOnSettingsRoute,
    fetchNotifications,
    updateSetting,
    primaryAccountHostname,
  ]);

  return { shortcuts };
}
