import {
  BellIcon,
  GearIcon,
  SyncIcon,
  XCircleIcon,
} from '@primer/octicons-react';
import { ipcRenderer } from 'electron';

import {
  type FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Logo } from '../components/Logo';
import { AppContext } from '../context/App';
import { openExternalLink } from '../utils/comms';
import { Constants } from '../utils/constants';
import { getNotificationCount } from '../utils/notifications';

export const Sidebar: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [recentlyRefreshed, setRecentlyRefreshed] = useState(false);

  const { isLoggedIn } = useContext(AppContext);
  const { notifications, fetchNotifications, isFetching } =
    useContext(AppContext);

  const useFetchInterval = (callback, delay: number) => {
    const savedCallback = useRef(callback);
    const intervalRef = useRef(null);

    useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
      if (delay !== null) {
        const id = setInterval(savedCallback.current, delay);
        intervalRef.current = id;
        return () => clearInterval(id);
      }
    }, [delay]);

    const resetFetchInterval = useCallback(() => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(savedCallback.current, delay);
      }
    }, [delay]);

    return { resetFetchInterval };
  };

  const { resetFetchInterval } = useFetchInterval(() => {
    if (isLoggedIn) {
      setRecentlyRefreshed(false);
      fetchNotifications();
    }
  }, Constants.FETCH_INTERVAL);

  const onOpenBrowser = useCallback(() => {
    openExternalLink(`https://github.com/${Constants.REPO_SLUG}`);
  }, []);

  const onOpenGitHubNotifications = useCallback(() => {
    openExternalLink('https://github.com/notifications');
  }, []);

  const quitApp = useCallback(() => {
    ipcRenderer.send('app-quit');
  }, []);

  const notificationsCount = useMemo(() => {
    return getNotificationCount(notifications);
  }, [notifications]);

  const sidebarButtonClasses =
    'flex justify-evenly items-center bg-transparent border-0 w-full text-sm text-white my-1 py-2 cursor-pointer hover:text-gray-500 focus:outline-none disabled:text-gray-500 disabled:cursor-default';

  return (
    <div className="flex flex-col fixed left-14 w-14 -ml-14 h-full bg-gray-sidebar overflow-y-auto">
      <div className="flex flex-col flex-1 items-center py-4">
        <button
          type="button"
          className="w-5 my-3 mx-auto cursor-pointer outline-none"
          title="Open Gitify on GitHub"
          onClick={onOpenBrowser}
          data-testid="gitify-logo"
        >
          <Logo aria-label="Open Gitify" />
        </button>

        <button
          type="button"
          className={`flex justify-around self-stretch items-center my-1 py-1 px-2 text-xs font-extrabold cursor-pointer ${
            notificationsCount > 0 ? 'text-green-500' : 'text-white'
          }`}
          onClick={onOpenGitHubNotifications}
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
              className={sidebarButtonClasses}
              title={
                recentlyRefreshed
                  ? 'Please wait before manually refreshing again...'
                  : 'Refresh Notifications'
              }
              onClick={() => {
                navigate('/', { replace: true });
                setRecentlyRefreshed(true);
                fetchNotifications();
                resetFetchInterval();
              }}
              disabled={isFetching || recentlyRefreshed}
            >
              <SyncIcon
                size={16}
                aria-label="Refresh Notifications"
                className={isFetching ? 'animate-spin' : undefined}
              />
            </button>

            <button
              type="button"
              className={sidebarButtonClasses}
              title="Settings"
              onClick={() => {
                if (location.pathname.startsWith('/settings')) {
                  navigate('/', { replace: true });
                } else {
                  navigate('/settings');
                }
              }}
            >
              <GearIcon size={16} aria-label="Settings" />
            </button>
          </>
        )}

        {!isLoggedIn && (
          <button
            type="button"
            className={sidebarButtonClasses}
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
