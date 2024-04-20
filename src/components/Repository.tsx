import { CheckIcon, MarkGithubIcon, ReadIcon } from '@primer/octicons-react';

import { type FC, useCallback, useContext } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import { AppContext } from '../context/App';
import type { Notification } from '../typesGithub';
import { openExternalLink } from '../utils/comms';
import Constants from '../utils/constants';
import { NotificationRow } from './NotificationRow';

interface IProps {
  hostname: string;
  repoNotifications: Notification[];
  repoName: string;
}

export const RepositoryNotifications: FC<IProps> = ({
  repoName,
  repoNotifications,
  hostname,
}) => {
  const {
    markRepoNotificationsRead,
    markRepoNotificationsDone,
    settings,
    notifications,
    removeNotificationsFromState,
  } = useContext(AppContext);

  const openBrowser = useCallback(() => {
    const url = repoNotifications[0].repository.html_url;
    openExternalLink(url);
  }, [repoNotifications]);

  const markRepoAsRead = useCallback(() => {
    const repoSlug = repoNotifications[0].repository.full_name;
    markRepoNotificationsRead(repoSlug, hostname);
    handleNotificationState(repoSlug);
  }, [repoNotifications, hostname]);

  const markRepoAsDone = useCallback(() => {
    const repoSlug = repoNotifications[0].repository.full_name;
    markRepoNotificationsDone(repoSlug, hostname);
    handleNotificationState(repoSlug);
  }, [repoNotifications, hostname]);

  const handleNotificationState = useCallback(
    (repoSlug: string) => {
      if (!settings.showAllNotifications) {
        removeNotificationsFromState(repoSlug, notifications, hostname);
      }

      for (const notification of repoNotifications) {
        if (notification.unread) {
          const notificationRow = document.getElementById(notification.id);
          notificationRow.className += Constants.READ_CLASS_NAME;
        }

        // TODO FIXME - this is not updating the notification count
        notification.unread = false;
      }
    },
    [repoNotifications, hostname, notifications],
  );

  const avatarUrl = repoNotifications[0].repository.owner.avatar_url;
  const repoSlug = repoNotifications[0].repository.full_name;

  return (
    <>
      <div className="flex py-2 px-3 bg-gray-100 dark:bg-gray-darker dark:text-white group">
        <div className="flex flex-1 space-x-3 items-center mt-0 text-sm font-medium overflow-hidden overflow-ellipsis whitespace-nowrap">
          {avatarUrl ? (
            <img
              className="rounded w-5 h-5"
              src={avatarUrl}
              alt={`${repoSlug}'s avatar`}
            />
          ) : (
            <MarkGithubIcon size={18} />
          )}
          <span
            className="cursor-pointer"
            onClick={openBrowser}
            onKeyDown={openBrowser}
          >
            {repoName}
          </span>
        </div>

        <div className="flex justify-center items-center gap-2 opacity-0 group-hover:opacity-80 transition-opacity">
          <button
            type="button"
            className="focus:outline-none h-full hover:text-green-500"
            title="Mark Repository as Done"
            onClick={markRepoAsDone}
          >
            <CheckIcon size={16} aria-label="Mark Repository as Done" />
          </button>

          <div className="w-[14px]" />

          {repoNotifications.some((notification) => notification.unread) ? (
            <button
              type="button"
              className="focus:outline-none h-full hover:text-green-500"
              title="Mark Repository as Read"
              onClick={markRepoAsRead}
            >
              <ReadIcon size={14} aria-label="Mark Repository as Read" />
            </button>
          ) : (
            <div className="w-[14px]" />
          )}
        </div>
      </div>

      <TransitionGroup>
        {repoNotifications.map((obj) => (
          <CSSTransition key={obj.id} timeout={250} classNames="notification">
            <NotificationRow
              key={obj.id}
              hostname={hostname}
              notification={obj}
            />
          </CSSTransition>
        ))}
      </TransitionGroup>
    </>
  );
};
