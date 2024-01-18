const { shell } = require('electron');

import React, { useCallback, useContext } from 'react';
import { ReadIcon } from '@primer/octicons-react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import { AppContext } from '../context/App';
import { Notification } from '../typesGithub';
import { NotificationRow } from './NotificationRow';

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
  const { markRepoNotifications } = useContext(AppContext);

  const openBrowser = useCallback(() => {
    const url = repoNotifications[0].repository.html_url;
    shell.openExternal(url);
  }, [repoNotifications]);

  const markRepoAsRead = useCallback(() => {
    const repoSlug = repoNotifications[0].repository.full_name;
    markRepoNotifications(repoSlug, hostname);
  }, [repoNotifications, hostname]);

  const avatarUrl = repoNotifications[0].repository.owner.avatar_url;

  return (
    <>
      <div className="flex p-2 bg-gray-100 dark:bg-gray-darker dark:text-white">
        <div className="flex flex-1 p-0.5 items-center mt-0 text-sm font-medium overflow-hidden overflow-ellipsis whitespace-nowrap">
          <img className="rounded w-5 h-5 ml-1 mr-3" src={avatarUrl} />
          <span onClick={openBrowser}>{repoName}</span>
        </div>

        <div className="flex w-8 justify-center items-center">
          <button className="focus:outline-none" onClick={markRepoAsRead}>
            <ReadIcon
              className="hover:text-green-500"
              size={16}
              aria-label="Mark Repository as Read"
            />
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
