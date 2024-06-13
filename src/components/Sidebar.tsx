import {
  BellIcon,
  GearIcon,
  SyncIcon,
  XCircleIcon,
} from '@primer/octicons-react';
import { type FC, useContext, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { AppContext } from '../context/App';
import { BUTTON_SIDEBAR_CLASS_NAME } from '../styles/gitify';
import { cn } from '../utils/cn';
import { quitApp } from '../utils/comms';
import { openGitHubNotifications, openGitifyRepository } from '../utils/links';
import { getNotificationCount } from '../utils/notifications';

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
    <div className="flex flex-col fixed left-14 w-14 -ml-14 h-full bg-gray-sidebar overflow-y-auto">
      <div className="flex flex-col flex-1 items-center py-4">
        <button
          type="button"
          className="w-5 my-3 mx-auto cursor-pointer outline-none"
          title="Open Gitify on GitHub"
          onClick={() => openGitifyRepository()}
          data-testid="gitify-logo"
        >
          <Logo aria-label="Open Gitify" />
        </button>

        <button
          type="button"
          className={cn(
            'flex justify-around self-stretch items-center my-1 py-1 px-2 text-xs font-extrabold cursor-pointer',
            notificationsCount > 0 ? 'text-green-500' : 'text-white',
          )}
          onClick={() => openGitHubNotifications()}
          title={`${notificationsCount} Unread Notifications`}
        >
          <BellIcon
            size={12}
            aria-label={`${notificationsCount} Unread Notifications`}
          />
          {notificationsCount > 0 && notificationsCount}
        </button>
      </div>

      <div className="py-4 px-3">
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
