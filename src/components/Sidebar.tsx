import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import { shell } from 'electron';
import { useLocation } from 'react-router-dom';
import * as Octicons from '@primer/octicons-react';
import { useHistory } from 'react-router-dom';

import { AppContext } from '../context/App';
import { Constants } from '../utils/Constants';
import { Logo } from '../js/components/ui/logo';
import { NotificationsContext } from '../context/Notifications';

export const Sidebar: React.FC = () => {
  const history = useHistory();
  const location = useLocation();

  const { accounts, isLoggedIn } = useContext(AppContext);
  const { notifications, fetchNotifications } = useContext(
    NotificationsContext
  );

  useEffect(() => {
    const iFrequency = 60000;

    const requestInterval = setInterval(() => {
      refreshNotifications();
    }, iFrequency);

    return () => {
      clearInterval(requestInterval);
    };
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [accounts]);

  const refreshNotifications = useCallback(() => {
    if (isLoggedIn) {
      fetchNotifications();
    }
  }, [isLoggedIn]);

  const onOpenBrowser = useCallback(() => {
    shell.openExternal(`https://github.com/${Constants.REPO_SLUG}`);
  }, []);

  const goToSettings = useCallback(() => {
    if (location.pathname === '/settings') {
      return history.goBack();
    }
    return history.push('/settings');
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
          <div className="flex justify-around	self-stretch items-center my-1 py-1 px-2 text-green-500 text-xs font-extrabold">
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
              onClick={refreshNotifications}
              aria-label="Refresh Notifications"
            >
              <Octicons.SyncIcon size={16} />
            </button>

            <button
              className={footerButtonClasses}
              onClick={goToSettings}
              aria-label="Settings"
            >
              <Octicons.GearIcon size={16} />
            </button>
          </>
        )}

        <div
          className={footerButtonClasses}
          onClick={onOpenBrowser}
          aria-label="View project on GitHub"
        >
          <Octicons.MarkGithubIcon size={14} />
        </div>
      </div>
    </div>
  );
};
