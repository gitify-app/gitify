import { type FC, type MouseEvent, useContext, useState } from 'react';

import { CheckIcon, ReadIcon } from '@primer/octicons-react';
import { Button, Stack } from '@primer/react';

import { AppContext } from '../../context/App';
import { Opacity, Size } from '../../types';
import type { Notification } from '../../typesGitHub';
import { cn } from '../../utils/cn';
import { isMarkAsDoneFeatureSupported } from '../../utils/features';
import { getChevronDetails } from '../../utils/helpers';
import { openRepository } from '../../utils/links';
import { AvatarWithFallback } from '../avatars/AvatarWithFallback';
import { HoverButton } from '../primitives/HoverButton';
import { HoverGroup } from '../primitives/HoverGroup';
import { NotificationRow } from './NotificationRow';

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
  const [showRepositoryNotifications, setShowRepositoryNotifications] =
    useState(true);

  const avatarUrl = repoNotifications[0].repository.owner.avatar_url;

  const actionMarkAsDone = () => {
    setAnimateExit(!settings.delayNotificationState);
    markNotificationsAsDone(repoNotifications);
  };

  const actionMarkAsRead = () => {
    setAnimateExit(!settings.delayNotificationState);
    markNotificationsAsRead(repoNotifications);
  };

  const actionToggleRepositoryNotifications = () => {
    setShowRepositoryNotifications(!showRepositoryNotifications);
  };

  const areAllRepoNotificationsRead = repoNotifications.every(
    (notification) => !notification.unread,
  );

  const Chevron = getChevronDetails(
    true,
    showRepositoryNotifications,
    'repository',
  );

  return (
    <>
      <Stack
        className={cn(
          'group relative pr-1 py-0.5',
          'bg-gitify-repository',
          animateExit &&
            'translate-x-full opacity-0 transition duration-350 ease-in-out',
          areAllRepoNotificationsRead && Opacity.READ,
        )}
        direction="horizontal"
        onClick={actionToggleRepositoryNotifications}
      >
        <Button
          alignContent="center"
          count={repoNotifications.length}
          data-testid="open-repository"
          onClick={(event: MouseEvent<HTMLElement>) => {
            // Don't trigger onClick of parent element.
            event.stopPropagation();
            openRepository(repoNotifications[0].repository);
          }}
          title="Open repository"
          variant="invisible"
        >
          <AvatarWithFallback
            alt={repoName}
            name={repoName}
            size={Size.LARGE}
            src={avatarUrl}
            userType={repoNotifications[0].repository.owner.type}
          />
        </Button>

        {!animateExit && (
          <HoverGroup bgColor="group-hover:bg-gitify-repository">
            <HoverButton
              action={actionMarkAsDone}
              enabled={isMarkAsDoneFeatureSupported(
                repoNotifications[0].account,
              )}
              icon={CheckIcon}
              label="Mark repository as done"
              testid="repository-mark-as-done"
            />

            <HoverButton
              action={actionMarkAsRead}
              icon={ReadIcon}
              label="Mark repository as read"
              testid="repository-mark-as-read"
            />

            <HoverButton
              action={actionToggleRepositoryNotifications}
              icon={Chevron.icon}
              label={Chevron.label}
              testid="repository-toggle"
            />
          </HoverGroup>
        )}
      </Stack>

      {showRepositoryNotifications &&
        repoNotifications.map((notification) => (
          <NotificationRow
            isAnimated={animateExit}
            key={notification.id}
            notification={notification}
          />
        ))}
    </>
  );
};
