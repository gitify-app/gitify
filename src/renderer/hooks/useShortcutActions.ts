import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { useAccountsStore, useSettingsStore } from '../stores';

import { getNavItem } from '../nav';
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
  const primaryAccount = useAccountsStore((s) => s.primaryAccount());

  const participating = useSettingsStore((s) => s.participating);
  const updateSetting = useSettingsStore((s) => s.updateSetting);

  const isOnFiltersRoute = location.pathname.startsWith('/filters');
  const isOnSettingsRoute = location.pathname.startsWith('/settings');
  const isLoading = status === 'loading';

  const home = getNavItem('home');
  const filters = getNavItem('filters');
  const settings = getNavItem('settings');

  const shortcuts: ShortcutConfigs = useMemo(() => {
    return {
      home: {
        key: home.shortcutKey,
        isAllowed: true,
        action: () => navigate(home.path, { replace: true }),
      },
      myNotifications: {
        key: 'n',
        isAllowed: isLoggedIn,
        action: () => primaryAccount && openHostNotifications(primaryAccount),
      },
      focusedMode: {
        key: 'w',
        isAllowed: isLoggedIn && !isLoading,
        action: () => updateSetting('participating', !participating),
      },
      filters: {
        key: filters.shortcutKey,
        isAllowed: isLoggedIn,
        action: () => {
          if (isOnFiltersRoute) {
            void navigate(home.path, { replace: true });
          } else {
            void navigate(filters.path);
          }
        },
      },
      myIssues: {
        key: 'i',
        isAllowed: isLoggedIn,
        action: () => primaryAccount && openHostIssues(primaryAccount),
      },
      myPullRequests: {
        key: 'p',
        isAllowed: isLoggedIn,
        action: () => primaryAccount && openHostPulls(primaryAccount),
      },
      refresh: {
        key: 'r',
        isAllowed: !isLoading,
        action: () => {
          if (isLoading) {
            return;
          }
          void navigate(home.path, { replace: true });
          void fetchNotifications();
        },
      },
      settings: {
        key: settings.shortcutKey,
        isAllowed: isLoggedIn,
        action: () => {
          if (isOnSettingsRoute) {
            void navigate(home.path, { replace: true });
            void fetchNotifications();
          } else {
            void navigate(settings.path);
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
    primaryAccount,
  ]);

  return { shortcuts };
}
