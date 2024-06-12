import { CheckIcon, MarkGithubIcon, ReadIcon } from '@primer/octicons-react';
import { type FC, useCallback, useContext } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { AppContext } from '../context/App';
import type { Account } from '../types';
import type { Notification } from '../typesGitHub';
import { openRepository } from '../utils/links';
import { NotificationRow } from './NotificationRow';

interface IProps {
  account: Account;
  repoNotifications: Notification[];
  repoName: string;
}

export const RepositoryNotifications: FC<IProps> = ({
  repoName,
  repoNotifications,
  account,
}) => {
  const { markRepoNotificationsRead, markRepoNotificationsDone } =
    useContext(AppContext);

  const markRepoAsRead = useCallback(() => {
    markRepoNotificationsRead(repoNotifications[0]);
  }, [repoNotifications, markRepoNotificationsRead]);

  const markRepoAsDone = useCallback(() => {
    markRepoNotificationsDone(repoNotifications[0]);
  }, [repoNotifications, markRepoNotificationsDone]);

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
            className="cursor-pointer truncate"
            onClick={() => openRepository(repoNotifications[0].repository)}
            onKeyDown={() => openRepository(repoNotifications[0].repository)}
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

          <button
            type="button"
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
            <NotificationRow key={obj.id} notification={obj} />
          </CSSTransition>
        ))}
      </TransitionGroup>
    </>
  );
};
