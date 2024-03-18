import { BellIcon } from '@primer/octicons-react';
import { ipcRenderer } from 'electron';
import React, { useCallback, useContext, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { Logo } from '../components/Logo';
import { AppContext } from '../context/App';
import { IconCog } from '../icons/Cog';
import { IconQuit } from '../icons/Quit';
import { IconRefresh } from '../icons/Refresh';
import { Constants } from '../utils/constants';
import { openExternalLink } from '../utils/comms';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { isLoggedIn } = useContext(AppContext);
  const { notifications, fetchNotifications } = useContext(AppContext);

  const onOpenBrowser = useCallback(() => {
    openExternalLink(`https://github.com/${Constants.REPO_SLUG}`);
  }, []);

  const onOpenGitHubNotifications = useCallback(() => {
    openExternalLink(`https://github.com/notifications`);
  }, []);

  const quitApp = useCallback(() => {
    ipcRenderer.send('app-quit');
  }, []);

  const notificationsCount = useMemo(() => {
    return notifications.reduce(
      (memo, account) => memo + account.notifications.length,
      0,
    );
  }, [notifications]);

  const footerButtonClasses =
    'flex justify-evenly items-center bg-transparent border-0 w-full text-sm text-white my-1 py-2 cursor-pointer hover:text-gray-500 focus:outline-none';

  return (
    <div className="flex flex-col fixed left-14 w-14 -ml-14 h-full bg-gray-sidebar overflow-y-auto	">
      <div className="flex flex-col flex-1 items-center py-4">
        <Logo
          className="w-5 my-3 mx-auto cursor-pointer"
          data-testid="gitify-logo"
          onClick={onOpenBrowser}
        />

        <div
          className={`flex justify-around self-stretch items-center my-1 py-1 px-2 text-xs font-extrabold cursor-pointer ${
            notificationsCount > 0 ? 'text-green-500' : 'text-white'
          }`}
          onClick={onOpenGitHubNotifications}
          aria-label={`${notificationsCount} Unread Notifications`}
        >
          <BellIcon size={12} />
          {notificationsCount > 0 && notificationsCount}
        </div>
      </div>

      <div className="py-4 px-3">
        {isLoggedIn && (
          <>
            <button
              className={footerButtonClasses}
              title="Refresh Notifications"
              onClick={() => {
                navigate('/', { replace: true });
                fetchNotifications();
              }}
            >
              <IconRefresh
                className="w-3.5 h-3.5"
                aria-label="Refresh Notifications"
              />
            </button>

            <button
              className={footerButtonClasses}
              title="Settings"
              onClick={() => {
                if (location.pathname.startsWith('/settings')) {
                  navigate('/', { replace: true });
                } else {
                  navigate('/settings');
                }
              }}
            >
              <IconCog className="w-4 h-4" aria-label="Settings" />
            </button>
          </>
        )}

        {!isLoggedIn && (
          <button
            className={footerButtonClasses}
            title="Quit Gitify"
            aria-label="Quit Gitify"
            onClick={quitApp}
          >
            <IconQuit className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
