import {
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  MarkGithubIcon,
  ReadIcon,
} from '@primer/octicons-react';
import { type FC, type MouseEvent, useContext, useState } from 'react';
import { AppContext } from '../context/App';
import { Opacity, Size } from '../types';
import type { Notification } from '../typesGitHub';
import { cn } from '../utils/cn';
import { isMarkAsDoneFeatureSupported } from '../utils/helpers';
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
  const { settings, markNotificationsAsRead, markNotificationsAsDone } =
    useContext(AppContext);
  const [animateExit, setAnimateExit] = useState(false);
  const [showAsRead, setShowAsRead] = useState(false);
  const [showRepositoryNotifications, setShowRepositoryNotifications] =
    useState(true);

  const avatarUrl = repoNotifications[0].repository.owner.avatar_url;

  const toggleRepositoryNotifications = () => {
    setShowRepositoryNotifications(!showRepositoryNotifications);
  };

  const ChevronIcon = showRepositoryNotifications
    ? ChevronDownIcon
    : ChevronRightIcon;

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
            'flex flex-1 gap-3 items-center truncate text-sm font-medium',
            animateExit &&
              'translate-x-full opacity-0 transition duration-[350ms] ease-in-out',
            showAsRead ? Opacity.READ : Opacity.MEDIUM,
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

        {!animateExit && (
          <HoverGroup>
            {isMarkAsDoneFeatureSupported(repoNotifications[0].account) && (
              <InteractionButton
                title="Mark Repository as Done"
                icon={CheckIcon}
                size={Size.MEDIUM}
                onClick={(event: MouseEvent<HTMLElement>) => {
                  // Don't trigger onClick of parent element.
                  event.stopPropagation();
                  setAnimateExit(!settings.delayNotificationState);
                  setShowAsRead(settings.delayNotificationState);
                  markNotificationsAsDone(repoNotifications);
                }}
              />
            )}
            <InteractionButton
              title="Mark Repository as Read"
              icon={ReadIcon}
              size={Size.SMALL}
              onClick={(event: MouseEvent<HTMLElement>) => {
                // Don't trigger onClick of parent element.
                event.stopPropagation();
                setAnimateExit(!settings.delayNotificationState);
                setShowAsRead(settings.delayNotificationState);
                markNotificationsAsRead(repoNotifications);
              }}
            />
            <InteractionButton
              title={toggleRepositoryNotificationsLabel}
              icon={ChevronIcon}
              size={Size.SMALL}
              onClick={toggleRepositoryNotifications}
            />
          </HoverGroup>
        )}
      </div>

      {showRepositoryNotifications &&
        repoNotifications.map((notification) => (
          <NotificationRow
            key={notification.id}
            notification={notification}
            isAnimated={animateExit}
            isRead={showAsRead}
          />
        ))}
    </>
  );
};
