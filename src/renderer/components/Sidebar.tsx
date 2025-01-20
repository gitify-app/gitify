import { type FC, useContext, useMemo } from 'react';
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
import { AppContext } from '../context/App';
import { quitApp } from '../utils/comms';
import { Constants } from '../utils/constants';
import { hasFiltersSet } from '../utils/filters';
import {
  openGitHubIssues,
  openGitHubNotifications,
  openGitHubPulls,
} from '../utils/links';
import { getNotificationCount } from '../utils/notifications';
import { LogoIcon } from './icons/LogoIcon';

export const Sidebar: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    notifications,
    fetchNotifications,
    isLoggedIn,
    status,
    settings,
    auth,
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

  const notificationsCount = useMemo(() => {
    return getNotificationCount(notifications);
  }, [notifications]);

  return (
    <div className="fixed left-12 -ml-12 flex h-full w-12 flex-col overflow-y-auto bg-gitify-sidebar">
      <div className="flex flex-1 flex-col">
        <Stack
          direction="vertical"
          align="center"
          gap="condensed"
          padding="normal"
        >
          <IconButton
            icon={LogoIcon}
            aria-label={APPLICATION.NAME}
            description="Home"
            unsafeDisableTooltip={false}
            size="small"
            variant="invisible"
            tooltipDirection="e"
            onClick={() => navigate('/', { replace: true })}
            data-testid="sidebar-home"
          />

          <IconButton
            icon={BellIcon}
            aria-label="Notifications"
            description={`${notificationsCount} unread notifications`}
            unsafeDisableTooltip={false}
            size="small"
            variant={notificationsCount > 0 ? 'primary' : 'invisible'}
            tooltipDirection="e"
            onClick={() => openGitHubNotifications(primaryAccountHostname)}
            data-testid="sidebar-notifications"
            sx={{ color: 'white' }}
          />

          {/* TODO - explore https://primer.style/components/selectpanel/react/alpha/ for a better UI for filters */}
          {isLoggedIn && (
            <IconButton
              icon={FilterIcon}
              aria-label="Filters"
              description="Filter notifications"
              unsafeDisableTooltip={false}
              size="small"
              variant={hasFiltersSet(settings) ? 'primary' : 'invisible'}
              tooltipDirection="e"
              onClick={() => toggleFilters()}
              data-testid="sidebar-filter-notifications"
              sx={{ color: 'white' }}
            />
          )}

          <IconButton
            icon={IssueOpenedIcon}
            aria-label="My issues"
            unsafeDisableTooltip={false}
            size="small"
            variant="invisible"
            tooltipDirection="e"
            onClick={() => openGitHubIssues(primaryAccountHostname)}
            data-testid="sidebar-my-issues"
            sx={{ color: 'white' }}
          />

          <IconButton
            icon={GitPullRequestIcon}
            aria-label="My pull requests"
            unsafeDisableTooltip={false}
            size="small"
            variant="invisible"
            tooltipDirection="e"
            onClick={() => openGitHubPulls(primaryAccountHostname)}
            data-testid="sidebar-my-pull-requests"
            sx={{ color: 'white' }}
          />
        </Stack>
      </div>

      <Stack
        direction="vertical"
        align="center"
        gap="condensed"
        padding="normal"
      >
        {isLoggedIn && (
          <>
            <IconButton
              icon={SyncIcon}
              aria-label="Refresh"
              description="Refresh notifications"
              unsafeDisableTooltip={false}
              size="small"
              variant="invisible"
              tooltipDirection="e"
              loading={status === 'loading'}
              disabled={status === 'loading'}
              onClick={() => refreshNotifications()}
              data-testid="sidebar-refresh"
              sx={{ color: 'white' }}
            />

            <IconButton
              icon={GearIcon}
              aria-label="Settings"
              unsafeDisableTooltip={false}
              size="small"
              variant="invisible"
              tooltipDirection="e"
              onClick={() => toggleSettings()}
              data-testid="sidebar-settings"
              sx={{ color: 'white' }}
            />
          </>
        )}

        {!isLoggedIn && (
          <IconButton
            icon={XCircleIcon}
            aria-label={`Quit ${APPLICATION.NAME}`}
            unsafeDisableTooltip={false}
            size="small"
            variant="invisible"
            tooltipDirection="e"
            onClick={() => quitApp()}
            data-testid="sidebar-quit"
            sx={{ color: 'white' }}
          />
        )}
      </Stack>
    </div>
  );
};
