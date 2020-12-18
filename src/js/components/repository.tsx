const { shell } = require('electron');

import * as React from 'react';
import { connect } from 'react-redux';
import { CheckIcon } from '@primer/octicons-react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import { markRepoNotifications } from '../actions';
import { Notification } from '../../types/github';
import NotificationItem from './notification';

interface IProps {
  hostname: string;
  repoNotifications: Notification[];
  repoName: string;
  markRepoNotifications: (repoSlug: string, hostname: string) => void;
}

export const RepositoryNotifications: React.FC<IProps> = (props) => {
  const openBrowser = () => {
    const url = props.repoNotifications[0].repository.html_url;
    shell.openExternal(url);
  };

  const markRepoAsRead = () => {
    const { hostname, repoNotifications } = props;
    const repoSlug = repoNotifications[0].repository.full_name;
    props.markRepoNotifications(repoSlug, hostname);
  };

  const { hostname, repoNotifications } = props;
  const avatarUrl = repoNotifications[0].repository.owner.avatar_url;

  return (
    <>
      <div className="flex flex-initial p-2 bg-gray-100 dark:bg-gray-darker dark:text-white">
        <div className="flex flex-1 p-0.5 items-center mt-0 text-sm font-medium overflow-hidden overflow-ellipsis whitespace-nowrap">
          <img className="rounded w-5 h-5 ml-1 mr-3" src={avatarUrl} />
          <span onClick={openBrowser}>{props.repoName}</span>
        </div>

        <div className="flex w-8 justify-center items-center">
          <button className="focus:outline-none" onClick={markRepoAsRead}>
            <CheckIcon
              className="hover:text-green-500"
              size={20}
              aria-label="Mark Repository as Read"
            />
          </button>
        </div>
      </div>

      <TransitionGroup>
        {repoNotifications.map((obj) => (
          <CSSTransition key={obj.id} timeout={250} classNames="notification">
            <NotificationItem
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

export default connect(null, { markRepoNotifications })(
  RepositoryNotifications
);
