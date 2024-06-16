import { CheckIcon, MarkGithubIcon, ReadIcon } from '@primer/octicons-react';
import { type FC, useCallback, useContext } from 'react';
import { AppContext } from '../context/App';
import type { Notification } from '../typesGitHub';
import { openRepository } from '../utils/links';
import { NotificationRow } from './NotificationRow';

interface IProps {
  repoNotifications: Notification[];
  repoName: string;
}

export const RepositoryNotifications: FC<IProps> = ({
  repoName,
  repoNotifications,
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
      <div className="group flex bg-gray-100 px-3 py-2 dark:bg-gray-darker dark:text-white">
        <div className="mt-0 flex flex-1 items-center space-x-3 overflow-hidden overflow-ellipsis whitespace-nowrap text-sm font-medium">
          {avatarUrl ? (
            <img
              className="size-5 rounded"
              src={avatarUrl}
              alt={`${repoSlug}'s avatar`}
            />
          ) : (
            <MarkGithubIcon size={18} />
          )}
          <span
            className="cursor-pointer truncate opacity-90"
            onClick={() => openRepository(repoNotifications[0].repository)}
            onKeyDown={() => openRepository(repoNotifications[0].repository)}
          >
            {repoName}
          </span>
        </div>

        <div className="flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-80">
          <button
            type="button"
            className="h-full hover:text-green-500 focus:outline-none"
            title="Mark Repository as Done"
            onClick={markRepoAsDone}
          >
            <CheckIcon size={16} aria-label="Mark Repository as Done" />
          </button>

          <div className="w-[14px]" />

          <button
            type="button"
            className="h-full hover:text-green-500 focus:outline-none"
            title="Mark Repository as Read"
            onClick={markRepoAsRead}
          >
            <ReadIcon size={14} aria-label="Mark Repository as Read" />
          </button>
        </div>
      </div>

      {repoNotifications.map((obj) => (
        <NotificationRow key={obj.id} notification={obj} />
      ))}
    </>
  );
};
