import { type FC, useContext } from 'react';
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

import { Constants } from '../constants';
import { AppContext } from '../context/App';
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
  } = useContext(AppContext);

  // We naively assume that the first account is the primary account for the purposes of our sidebar quick links
  const primaryAccountHostname =
    auth.accounts[0]?.hostname ?? Constants.DEFAULT_AUTH_OPTIONS.hostname;

  const toggleFilters = () => {
    if (location.pathname.startsWith('/filters')) {
      navigate('/', { replace: true });
    } else {
      navigate('/filters');
    }
  };

  const toggleSettings = () => {
    if (location.pathname.startsWith('/settings')) {
      navigate('/', { replace: true });
      fetchNotifications();
    } else {
      navigate('/settings');
    }
  };

  const refreshNotifications = () => {
    navigate('/', { replace: true });
    fetchNotifications();
  };

  return (
    <Stack
      className="fixed left-sidebar -ml-sidebar w-sidebar h-full bg-gitify-sidebar [&_svg]:text-white"
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
          onClick={() => navigate('/', { replace: true })}
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
              data-testid="sidebar-refresh"
              description="Refresh notifications"
              disabled={status === 'loading'}
              icon={SyncIcon}
              loading={status === 'loading'}
              onClick={() => refreshNotifications()}
              size="small"
              tooltipDirection="e"
              variant="invisible"
            />

            <IconButton
              aria-label="Settings"
              data-testid="sidebar-settings"
              icon={GearIcon}
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
