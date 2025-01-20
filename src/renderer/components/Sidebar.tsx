import {
  BellIcon,
  FilterIcon,
  GearIcon,
  GitPullRequestIcon,
  IssueOpenedIcon,
  SyncIcon,
  XCircleIcon,
} from '@primer/octicons-react';
import { type FC, useContext, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { APPLICATION } from '../../shared/constants';
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
import { SidebarButton } from './buttons/SidebarButton';
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
      <div className="flex flex-1 flex-col items-center py-4">
        <button
          type="button"
          className="mx-auto my-3 cursor-pointer outline-none"
          title="Home"
          onClick={() => navigate('/', { replace: true })}
        >
          <LogoIcon size={Size.SMALL} aria-label={`Open ${APPLICATION.NAME}`} />
        </button>

        <SidebarButton
          title={`${notificationsCount} unread notifications`}
          metric={isLoggedIn ? notificationsCount : null}
          icon={BellIcon}
          onClick={() => openGitHubNotifications(primaryAccountHostname)}
        />

        <SidebarButton
          title="My issues"
          icon={IssueOpenedIcon}
          onClick={() => openGitHubIssues(primaryAccountHostname)}
        />

        <SidebarButton
          title="My pull requests"
          icon={GitPullRequestIcon}
          onClick={() => openGitHubPulls(primaryAccountHostname)}
        />
      </div>

      <div className="px-3 py-4">
        {isLoggedIn && (
          <>
            <SidebarButton
              title="Refresh notifications"
              icon={SyncIcon}
              size={Size.MEDIUM}
              loading={status === 'loading'}
              disabled={status === 'loading'}
              onClick={() => refreshNotifications()}
            />

            <SidebarButton
              title="Filters"
              icon={FilterIcon}
              size={Size.MEDIUM}
              metric={filterCount}
              onClick={() => toggleFilters()}
            />

            <SidebarButton
              title="Settings"
              icon={GearIcon}
              size={Size.MEDIUM}
              onClick={() => toggleSettings()}
            />
          </>
        )}

        {!isLoggedIn && (
          <SidebarButton
            title={`Quit ${APPLICATION.NAME}`}
            icon={XCircleIcon}
            size={Size.MEDIUM}
            onClick={() => quitApp()}
          />
        )}
      </div>
    </div>
  );
};
