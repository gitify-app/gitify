import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MarkGithubIcon,
  ReadIcon,
} from '@primer/octicons-react';
import {
  type FC,
  type MouseEvent,
  useCallback,
  useContext,
  useState,
} from 'react';
import { AppContext } from '../context/App';
import { Size } from '../types';
import type { Notification } from '../typesGitHub';
import { openRepository } from '../utils/links';
import { NotificationRow } from './NotificationRow';
import { AvatarIcon } from './icons/AvatarIcon';

interface IRepositoryNotifications {
  repoNotifications: Notification[];
  repoName: string;
}

export const RepositoryNotifications: FC<IRepositoryNotifications> = ({
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

  const [showRepositoryNotifications, setShowRepositoryNotifications] =
    useState(true);

  const toggleRepositoryNotifications = () => {
    setShowRepositoryNotifications(!showRepositoryNotifications);
  };

  const ChevronIcon = showRepositoryNotifications
    ? ChevronDownIcon
    : ChevronUpIcon;

  const toggleRepositoryNotificationsLabel = showRepositoryNotifications
    ? 'Hide repository notifications'
    : 'Show repository notifications';

  return (
    <>
      <div
        className="group flex items-center justify-between bg-gray-100 px-3 py-2 dark:bg-gray-darker dark:text-white"
        onClick={toggleRepositoryNotifications}
      >
        <div className="mt-0 flex flex-1 space-x-3 overflow-hidden overflow-ellipsis whitespace-nowrap text-sm font-medium">
          <AvatarIcon
            title={repoName}
            url={avatarUrl}
            size={Size.LARGE}
            defaultIcon={MarkGithubIcon}
          />
          <span
            className="cursor-pointer truncate opacity-90"
            onClick={(event: MouseEvent<HTMLElement>) => {
              // Don't trigger onClick of parent element.
              event.stopPropagation();
              openRepository(repoNotifications[0].repository);
            }}
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
            <CheckIcon
              size={Size.MEDIUM}
              aria-label="Mark Repository as Done"
            />
          </button>

          <button
            type="button"
            className="h-full hover:text-green-500 focus:outline-none"
            title="Mark Repository as Read"
            onClick={markRepoAsRead}
          >
            <ReadIcon size={Size.SMALL} aria-label="Mark Repository as Read" />
          </button>

          <button
            type="button"
            className="h-full hover:text-green-500 focus:outline-none"
            title={toggleRepositoryNotificationsLabel}
            onClick={toggleRepositoryNotifications}
          >
            <ChevronIcon size={Size.SMALL} />
          </button>
        </div>
      </div>

      {showRepositoryNotifications &&
        repoNotifications.map((notification) => (
          <NotificationRow key={notification.id} notification={notification} />
        ))}
    </>
  );
};
