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
import { Opacity, Size } from '../types';
import type { Notification } from '../typesGitHub';
import { cn } from '../utils/cn';
import { openRepository } from '../utils/links';
import { HoverGroup } from './HoverGroup';
import { NotificationRow } from './NotificationRow';
import { InteractionButton } from './buttons/InteractionButton';
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
        className="group flex justify-between bg-gray-100 px-3 py-1.5 dark:bg-gray-darker dark:text-white"
        onClick={toggleRepositoryNotifications}
      >
        <div
          className={cn(
            'flex flex-1 gap-4 items-center overflow-hidden overflow-ellipsis whitespace-nowrap text-sm font-medium',
            Opacity.MEDIUM,
          )}
        >
          <AvatarIcon
            title={repoName}
            url={avatarUrl}
            size={Size.XSMALL}
            defaultIcon={MarkGithubIcon}
          />
          <span
            className="cursor-pointer truncate"
            onClick={(event: MouseEvent<HTMLElement>) => {
              // Don't trigger onClick of parent element.
              event.stopPropagation();
              openRepository(repoNotifications[0].repository);
            }}
          >
            {repoName}
          </span>
        </div>

        <HoverGroup>
          <InteractionButton
            title="Mark Repository as Done"
            icon={CheckIcon}
            size={Size.MEDIUM}
            onClick={markRepoAsDone}
          />
          <InteractionButton
            title="Mark Repository as Read"
            icon={ReadIcon}
            size={Size.SMALL}
            onClick={markRepoAsRead}
          />
          <InteractionButton
            title={toggleRepositoryNotificationsLabel}
            icon={ChevronIcon}
            size={Size.SMALL}
            onClick={toggleRepositoryNotifications}
          />
        </HoverGroup>
      </div>

      {showRepositoryNotifications &&
        repoNotifications.map((notification) => (
          <NotificationRow key={notification.id} notification={notification} />
        ))}
    </>
  );
};
