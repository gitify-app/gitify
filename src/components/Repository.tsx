import React, { useCallback, useContext } from 'react';
import { ReadIcon, CheckIcon } from '@primer/octicons-react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import { AppContext } from '../context/App';
import { Notification } from '../typesGithub';
import { NotificationRow } from './NotificationRow';
import { openExternalLink } from '../utils/comms';

interface IProps {
  hostname: string;
  repoNotifications: Notification[];
  repoName: string;
}

export const RepositoryNotifications: React.FC<IProps> = ({
  repoName,
  repoNotifications,
  hostname,
}) => {
  const { markRepoNotifications, markRepoNotificationsDone } =
    useContext(AppContext);

  const openBrowser = useCallback(() => {
    const url = repoNotifications[0].repository.html_url;
    openExternalLink(url);
  }, [repoNotifications]);

  const markRepoAsRead = useCallback(() => {
    const repoSlug = repoNotifications[0].repository.full_name;
    markRepoNotifications(repoSlug, hostname);
  }, [repoNotifications, hostname]);

  const markRepoAsDone = useCallback(() => {
    const repoSlug = repoNotifications[0].repository.full_name;
    markRepoNotificationsDone(repoSlug, hostname);
  }, [repoNotifications, hostname]);

  const avatarUrl = repoNotifications[0].repository.owner.avatar_url;

  return (
    <>
      <div className="flex py-2 px-3 bg-gray-100 dark:bg-gray-darker dark:text-white">
        <div className="flex flex-1 space-x-3 items-center mt-0 text-sm font-medium overflow-hidden overflow-ellipsis whitespace-nowrap">
          <img className="rounded w-5 h-5" src={avatarUrl} />
          <span onClick={openBrowser}>{repoName}</span>
        </div>

        <div className="flex justify-center items-center gap-2">
          <button
            className="focus:outline-none h-full hover:text-green-500"
            title="Mark Repository as Done"
            onClick={markRepoAsDone}
          >
            <CheckIcon size={16} aria-label="Mark Repository as Done" />
          </button>

          <div className="w-[14px]" />

          <button
            className="focus:outline-none h-full hover:text-green-500"
            title="Mark Repository as Read"
            onClick={markRepoAsRead}
          >
            <ReadIcon size={14} aria-label="Mark Repository as Read" />
          </button>
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
