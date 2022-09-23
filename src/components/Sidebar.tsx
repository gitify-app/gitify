import React, { useCallback, useContext, useMemo } from 'react';
import { shell, ipcRenderer } from 'electron';
import * as Octicons from '@primer/octicons-react';
import { useHistory } from 'react-router-dom';

import { AppContext } from '../context/App';
import { Constants } from '../utils/constants';
import { IconCog } from '../icons/Cog';
import { IconRefresh } from '../icons/Refresh';
import { Logo } from '../components/Logo';
import { IconQuit } from '../icons/Quit';

export const Sidebar: React.FC = () => {
  const history = useHistory();

  const { isLoggedIn } = useContext(AppContext);
  const { notifications, fetchNotifications } = useContext(AppContext);

  const onOpenBrowser = useCallback(() => {
    shell.openExternal(`https://github.com/${Constants.REPO_SLUG}`);
  }, []);

  const onOpenGitHubNotifications = useCallback(() => {
    shell.openExternal(`https://github.com/notifications`);
  }, []);

  const quitApp = useCallback(() => {
    ipcRenderer.send('app-quit');
  }, []);

  const notificationsCount = useMemo(() => {
    return notifications.reduce(
      (memo, account) => memo + account.notifications.length,
      0
    );
  }, [notifications]);

  const footerButtonClasses =
    'flex justify-evenly items-center bg-transparent border-0 w-full text-sm text-white my-1 py-2 cursor-pointer hover:text-gray-500 focus:outline-none';

  return (
    <div className="flex flex-col fixed left-14 w-14 -ml-14 h-full bg-gray-sidebar overflow-y-auto	">
      <div className="flex flex-col flex-1 items-center py-4">
        <Logo
          className="w-5 my-3 mx-auto cursor-pointer"
          onClick={onOpenBrowser}
        />

        {notificationsCount > 0 && (
          <div
            className="flex justify-around self-stretch items-center my-1 py-1 px-2 text-green-500 text-xs font-extrabold cursor-pointer"
            onClick={onOpenGitHubNotifications}
            aria-label={`${notificationsCount} Unread Notifications`}
          >
            <Octicons.BellIcon size={12} />
            {notificationsCount}
          </div>
        )}
      </div>

      <div className="py-4 px-3">
        {isLoggedIn && (
          <>
            <button
              className={footerButtonClasses}
              onClick={fetchNotifications}
              aria-label="Refresh Notifications"
            >
              <IconRefresh className="w-3.5 h-3.5" />
            </button>

            <button
              className={footerButtonClasses}
              onClick={() => history.push('/settings')}
              aria-label="Settings"
            >
              <IconCog className="w-4 h-4" />
            </button>
          </>
        )}

        {!isLoggedIn && (
          <button
            className={footerButtonClasses}
            onClick={quitApp}
            aria-label="Quit App"
          >
            <IconQuit className="w-3.5 h-3.5" />
          </button>
        )}

        <div
          className={footerButtonClasses}
          onClick={onOpenBrowser}
          aria-label="View project on GitHub"
        >
          <Octicons.MarkGithubIcon size={15} />
        </div>
      </div>
    </div>
  );
};
