import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { getPrimaryAccountHostname } from '../utils/auth/utils';
import { quitApp } from '../utils/comms';
import {
  openGitHubIssues,
  openGitHubNotifications,
  openGitHubPulls,
} from '../utils/links';
import { useAppContext } from './useAppContext';

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

  const {
    auth,
    fetchNotifications,
    isLoggedIn,
    status,
    settings,
    updateSetting,
  } = useAppContext();

  const isOnFiltersRoute = location.pathname.startsWith('/filters');
  const isOnSettingsRoute = location.pathname.startsWith('/settings');
  const isLoading = status === 'loading';

  const primaryAccountHostname = getPrimaryAccountHostname(auth);

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
        action: () => openGitHubNotifications(primaryAccountHostname),
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
      myIssues: {
        key: 'i',
        isAllowed: isLoggedIn,
        action: () => openGitHubIssues(primaryAccountHostname),
      },
      myPullRequests: {
        key: 'p',
        isAllowed: isLoggedIn,
        action: () => openGitHubPulls(primaryAccountHostname),
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
