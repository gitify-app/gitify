import { type FC, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  BellIcon,
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
  } = useAppContext();

  const primaryAccountHostname = getPrimaryAccountHostname(auth);

  const goHome = useCallback(() => {
    navigate('/', { replace: true });
  }, []);

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

      switch (key) {
        case 'h':
          event.preventDefault();
          goHome();
          break;
        case 'r':
          if (status !== 'loading') {
            event.preventDefault();
            refreshNotifications();
          }
          break;
        case 's':
          if (isLoggedIn) {
            event.preventDefault();
            toggleSettings();
          }
          break;
        case 'f':
          if (isLoggedIn) {
            event.preventDefault();
            toggleFilters();
          }
          break;
        default:
          // No action for other keys
          break;
      }
    };

    document.addEventListener('keydown', sidebarShortcutHandler);

    return () => {
      document.removeEventListener('keydown', sidebarShortcutHandler);
    };
  }, [
    isLoggedIn,
    status,
    goHome,
    toggleFilters,
    toggleSettings,
    refreshNotifications,
  ]);

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
          keybindingHint="H"
          onClick={() => goHome()}
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
          <IconButton
            aria-label="Filters"
            data-testid="sidebar-filter-notifications"
            description="Filter notifications"
            icon={FilterIcon}
            keybindingHint="F"
            onClick={() => toggleFilters()}
            size="small"
            tooltipDirection="e"
            variant={hasActiveFilters(settings) ? 'primary' : 'invisible'}
          />
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
              keybindingHint="R"
              // loading={status === 'loading'}
              onClick={() => refreshNotifications()}
              size="small"
              tooltipDirection="e"
              variant="invisible"
            />

            <IconButton
              aria-label="Settings"
              data-testid="sidebar-settings"
              description="Settings"
              icon={GearIcon}
              keybindingHint="S"
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
