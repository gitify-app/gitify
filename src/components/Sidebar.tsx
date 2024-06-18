import {
  BellIcon,
  GearIcon,
  GitPullRequestIcon,
  IssueOpenedIcon,
  SyncIcon,
  XCircleIcon,
} from '@primer/octicons-react';
import { type FC, useContext, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { AppContext } from '../context/App';
import { BUTTON_SIDEBAR_CLASS_NAME } from '../styles/gitify';
import { quitApp } from '../utils/comms';
import {
  openGitHubIssues,
  openGitHubNotifications,
  openGitHubPulls,
  openGitifyRepository,
} from '../utils/links';
import { getNotificationCount } from '../utils/notifications';
import { SidebarButton } from './buttons/SidebarButton';

export const Sidebar: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { notifications, fetchNotifications, isLoggedIn, status } =
    useContext(AppContext);

  const toggleSettings = () => {
    if (location.pathname.startsWith('/settings')) {
      navigate('/', { replace: true });
    } else {
      navigate('/settings');
    }
  };

  const notificationsCount = useMemo(() => {
    return getNotificationCount(notifications);
  }, [notifications]);

  return (
    <div className="fixed left-14 -ml-14 flex h-full w-14 flex-col overflow-y-auto bg-gray-sidebar">
      <div className="flex flex-1 flex-col items-center py-4">
        <button
          type="button"
          className="mx-auto my-3 w-5 cursor-pointer outline-none"
          title="Open Gitify on GitHub"
          onClick={() => openGitifyRepository()}
          data-testid="gitify-logo"
        >
          <Logo aria-label="Open Gitify" />
        </button>

        <SidebarButton
          title={`${notificationsCount} Unread Notifications`}
          metric={notificationsCount}
          icon={BellIcon}
          onClick={() => openGitHubNotifications()}
        />

        <SidebarButton
          title={'My Issues'}
          icon={IssueOpenedIcon}
          onClick={() => openGitHubIssues()}
        />

        <SidebarButton
          title={'My Pull Requests'}
          icon={GitPullRequestIcon}
          onClick={() => openGitHubPulls()}
        />
      </div>

      <div className="px-3 py-4">
        {isLoggedIn && (
          <>
            <button
              type="button"
              className={BUTTON_SIDEBAR_CLASS_NAME}
              title="Refresh Notifications"
              onClick={() => {
                navigate('/', { replace: true });
                fetchNotifications();
              }}
              disabled={status === 'loading'}
            >
              <SyncIcon
                size={16}
                aria-label="Refresh Notifications"
                className={status === 'loading' ? 'animate-spin' : undefined}
              />
            </button>
            <button
              type="button"
              className={BUTTON_SIDEBAR_CLASS_NAME}
              title="Settings"
              onClick={toggleSettings}
            >
              <GearIcon size={16} aria-label="Settings" />
            </button>
          </>
        )}

        {!isLoggedIn && (
          <button
            type="button"
            className={BUTTON_SIDEBAR_CLASS_NAME}
            title="Quit Gitify"
            aria-label="Quit Gitify"
            onClick={quitApp}
          >
            <XCircleIcon size={16} aria-label="Quit Gitify" />
          </button>
        )}
      </div>
    </div>
  );
};
