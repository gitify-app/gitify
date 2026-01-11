import { type FC, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  BellIcon,
  CrosshairsIcon,
  EyeIcon,
  FilterIcon,
  GearIcon,
  GitPullRequestIcon,
  IssueOpenedIcon,
  SyncIcon,
  XCircleIcon,
} from '@primer/octicons-react';
import { IconButton, Stack } from '@primer/react';

import { APPLICATION } from '../../shared/constants';

import { useAppContext } from '../context/App';
import { getPrimaryAccountHostname } from '../utils/auth/utils';
import { quitApp } from '../utils/comms';
import {
  openGitHubIssues,
  openGitHubNotifications,
  openGitHubPulls,
} from '../utils/links';
import { hasActiveFilters } from '../utils/notifications/filters/filter';
import { LogoIcon } from './icons/LogoIcon';

export const Sidebar: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    fetchNotifications,
    isLoggedIn,
    status,
    settings,
    auth,
    unreadNotificationCount,
    hasUnreadNotifications,
    updateSetting,
  } = useAppContext();

  const primaryAccountHostname = getPrimaryAccountHostname(auth);

  const goHome = useCallback(() => {
    navigate('/', { replace: true });
  }, []);

  const toggleFocusMode = useCallback(() => {
    updateSetting('participating', !settings.participating);
  }, [settings.participating, updateSetting]);

  const toggleFilters = useCallback(() => {
    if (location.pathname.startsWith('/filters')) {
      navigate('/', { replace: true });
    } else {
      navigate('/filters');
    }
  }, [location.pathname]);

  const toggleSettings = useCallback(() => {
    if (location.pathname.startsWith('/settings')) {
      navigate('/', { replace: true });
      fetchNotifications();
    } else {
      navigate('/settings');
    }
  }, [location.pathname, fetchNotifications]);

  const refreshNotifications = useCallback(() => {
    goHome();
    fetchNotifications();
  }, [goHome, fetchNotifications]);

  type ShortcutConfig = {
    hotkey: string;
    action: () => void;
    enabled?: boolean;
  };

  type ShortcutName =
    | 'home'
    | 'refresh'
    | 'settings'
    | 'filters'
    | 'focusedMode';

  const shortcuts: Record<ShortcutName, ShortcutConfig> = {
    home: {
      hotkey: 'h',
      action: goHome,
      enabled: true,
    },
    focusedMode: {
      hotkey: 'w',
      action: toggleFocusMode,
      enabled: status !== 'loading',
    },
    filters: {
      hotkey: 'f',
      action: toggleFilters,
      enabled: isLoggedIn,
    },
    refresh: {
      hotkey: 'r',
      action: refreshNotifications,
      enabled: status !== 'loading',
    },
    settings: {
      hotkey: 's',
      action: toggleSettings,
      enabled: isLoggedIn,
    },
  };

  const getKeybindingHint = (handler: () => void): string | undefined => {
    const shortcut = Object.values(shortcuts).find((s) => s.action === handler);
    return shortcut ? shortcut.hotkey.toUpperCase() : undefined;
  };

  useEffect(() => {
    const sidebarShortcutHandler = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input, textarea, or with modifiers
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      ) {
        return;
      }

      const key = event.key.toLowerCase();
      const shortcut = Object.values(shortcuts).find((s) => s.hotkey === key);

      if (shortcut && shortcut.enabled !== false) {
        event.preventDefault();
        shortcut.action();
      }
    };

    document.addEventListener('keydown', sidebarShortcutHandler);

    return () => {
      document.removeEventListener('keydown', sidebarShortcutHandler);
    };
  }, []);

  return (
    <Stack
      className="fixed w-sidebar h-full bg-gitify-sidebar [&_svg]:text-white"
      direction="vertical"
      justify="space-between"
    >
      <Stack
        align="center"
        direction="vertical"
        gap="condensed"
        padding="normal"
      >
        <IconButton
          aria-label={APPLICATION.NAME}
          data-testid="sidebar-home"
          description="Home"
          icon={LogoIcon}
          keybindingHint={shortcuts.home.hotkey}
          onClick={() => shortcuts.home.action()}
          size="small"
          tooltipDirection="e"
          variant="invisible"
        />

        <IconButton
          aria-label="Notifications"
          data-testid="sidebar-notifications"
          description={`${unreadNotificationCount} unread notifications ↗`}
          icon={BellIcon}
          onClick={() => openGitHubNotifications(primaryAccountHostname)}
          size="small"
          tooltipDirection="e"
          variant={hasUnreadNotifications ? 'primary' : 'invisible'}
        />

        {isLoggedIn && (
          <>
            <IconButton
              aria-label="Toggle focused mode"
              data-testid="sidebar-focused-mode"
              description={
                settings.participating
                  ? 'Focused (participating only)'
                  : 'Participating and watching'
              }
              icon={settings.participating ? CrosshairsIcon : EyeIcon}
              keybindingHint={shortcuts.focusedMode.hotkey}
              onClick={() => shortcuts.focusedMode.action()}
              size="small"
              tooltipDirection="e"
              variant={settings.participating ? 'primary' : 'invisible'}
            />

            <IconButton
              aria-label="Filters"
              data-testid="sidebar-filter-notifications"
              description="Filter notifications"
              icon={FilterIcon}
              keybindingHint={shortcuts.filters.hotkey}
              onClick={() => shortcuts.filters.action()}
              size="small"
              tooltipDirection="e"
              variant={hasActiveFilters(settings) ? 'primary' : 'invisible'}
            />
          </>
        )}

        <IconButton
          aria-label="My issues ↗"
          data-testid="sidebar-my-issues"
          icon={IssueOpenedIcon}
          onClick={() => openGitHubIssues(primaryAccountHostname)}
          size="small"
          tooltipDirection="e"
          variant="invisible"
        />

        <IconButton
          aria-label="My pull requests ↗"
          data-testid="sidebar-my-pull-requests"
          icon={GitPullRequestIcon}
          onClick={() => openGitHubPulls(primaryAccountHostname)}
          size="small"
          tooltipDirection="e"
          variant="invisible"
        />
      </Stack>

      <Stack
        align="center"
        direction="vertical"
        gap="condensed"
        padding="normal"
      >
        {isLoggedIn && (
          <>
            <IconButton
              aria-label="Refresh"
              className={status === 'loading' ? 'animate-spin' : ''}
              data-testid="sidebar-refresh"
              description="Refresh notifications"
              disabled={status === 'loading'}
              icon={SyncIcon}
              keybindingHint={shortcuts.refresh.hotkey}
              // loading={status === 'loading'}
              onClick={() => shortcuts.refresh.action()}
              size="small"
              tooltipDirection="e"
              variant="invisible"
            />

            <IconButton
              aria-label="Settings"
              data-testid="sidebar-settings"
              description="Settings"
              icon={GearIcon}
              keybindingHint={getKeybindingHint(toggleSettings)}
              onClick={() => toggleSettings()}
              size="small"
              tooltipDirection="e"
              variant="invisible"
            />
          </>
        )}

        {!isLoggedIn && (
          <IconButton
            aria-label={`Quit ${APPLICATION.NAME}`}
            data-testid="sidebar-quit"
            icon={XCircleIcon}
            onClick={() => quitApp()}
            size="small"
            tooltipDirection="e"
            variant="invisible"
          />
        )}
      </Stack>
    </Stack>
  );
};
