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

import { Button, IconButton, Stack } from '@primer/react';
import { AppContext } from '../context/App';
import { Size } from '../types';
import { quitApp } from '../utils/comms';
import { Constants } from '../utils/constants';
import { getFilterCount } from '../utils/helpers';
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

  const filterCount = useMemo(() => {
    return getFilterCount(settings);
  }, [settings]);

  return (
    <div className="fixed left-14 -ml-14 flex h-full w-14 flex-col overflow-y-auto bg-gray-sidebar">
      <div className="flex flex-1 flex-col">
        <Stack
          direction="vertical"
          align="center"
          gap="condensed"
          padding="normal"
        >
          <Button
            aria-label="Home"
            size="small"
            variant="invisible"
            onClick={() => navigate('/', { replace: true })}
          >
            <LogoIcon size={Size.SMALL} />
          </Button>

          <Button
            aria-label={`${notificationsCount} unread notifications`}
            leadingVisual={BellIcon}
            size="small"
            variant={notificationsCount > 0 ? 'primary' : 'invisible'}
            count={isLoggedIn ? notificationsCount : null}
            onClick={() => openGitHubNotifications(primaryAccountHostname)}
          />

          {/* TODO - explore https://primer.style/components/selectpanel/react/alpha/ for a better UI for filters */}
          {isLoggedIn && (
            <Button
              aria-label="Filters"
              leadingVisual={FilterIcon}
              size="small"
              variant={filterCount > 0 ? 'primary' : 'invisible'}
              count={filterCount}
              onClick={() => toggleFilters()}
            />
          )}

          <IconButton
            aria-label="My issues"
            icon={IssueOpenedIcon}
            size="small"
            variant="invisible"
            tooltipDirection="e"
            onClick={() => openGitHubIssues(primaryAccountHostname)}
          />
          <IconButton
            aria-label="My pull requests"
            icon={GitPullRequestIcon}
            size="small"
            variant="invisible"
            tooltipDirection="e"
            onClick={() => openGitHubPulls(primaryAccountHostname)}
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
              aria-label="Refresh notifications"
              icon={SyncIcon}
              size="small"
              variant="invisible"
              tooltipDirection="e"
              loading={status === 'loading'}
              disabled={status === 'loading'}
              onClick={() => refreshNotifications()}
            />

            <IconButton
              aria-label="Settings"
              icon={GearIcon}
              size="small"
              variant="invisible"
              tooltipDirection="e"
              onClick={() => toggleSettings()}
            />
          </>
        )}

        {!isLoggedIn && (
          <IconButton
            aria-label="Quit Gitify"
            icon={XCircleIcon}
            size="small"
            variant="invisible"
            tooltipDirection="e"
            onClick={() => quitApp()}
          />
        )}
      </Stack>
    </div>
  );
};
