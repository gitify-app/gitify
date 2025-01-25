import { CheckIcon, ReadIcon } from '@primer/octicons-react';
import { Box, Button, Stack } from '@primer/react';
import { type FC, type MouseEvent, useContext, useState } from 'react';

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
  const [showAsRead, setShowAsRead] = useState(false);
  const [showRepositoryNotifications, setShowRepositoryNotifications] =
    useState(true);

  const avatarUrl = repoNotifications[0].repository.owner.avatar_url;

  const actionMarkAsDone = () => {
    setAnimateExit(!settings.delayNotificationState);
    setShowAsRead(settings.delayNotificationState);
    markNotificationsAsDone(repoNotifications);
  };

  const actionMarkAsRead = () => {
    setAnimateExit(!settings.delayNotificationState);
    setShowAsRead(settings.delayNotificationState);
    markNotificationsAsRead(repoNotifications);
  };

  const actionToggleRepositoryNotifications = () => {
    setShowRepositoryNotifications(!showRepositoryNotifications);
  };

  const Chevron = getChevronDetails(
    true,
    showRepositoryNotifications,
    'repository',
  );

  return (
    <>
      <Box
        className={cn(
          'group pr-1 py-0.5',
          'bg-gitify-repository',
          animateExit &&
            'translate-x-full opacity-0 transition duration-[350ms] ease-in-out',
          showAsRead && Opacity.READ,
        )}
        onClick={actionToggleRepositoryNotifications}
      >
        <Stack
          direction="horizontal"
          align="center"
          gap="condensed"
          className="relative"
        >
          <Button
            title="Open repository"
            variant="invisible"
            alignContent="center"
            count={repoNotifications.length}
            onClick={(event: MouseEvent<HTMLElement>) => {
              // Don't trigger onClick of parent element.
              event.stopPropagation();
              openRepository(repoNotifications[0].repository);
            }}
            data-testid="open-repository"
          >
            <AvatarWithFallback
              src={avatarUrl}
              alt={repoName}
              name={repoName}
              size={Size.LARGE}
              userType={repoNotifications[0].repository.owner.type}
            />
          </Button>

          {!animateExit && (
            <HoverGroup bgColor="bg-gitify-repository">
              <HoverButton
                label="Mark repository as done"
                icon={CheckIcon}
                enabled={isMarkAsDoneFeatureSupported(
                  repoNotifications[0].account,
                )}
                testid="repository-mark-as-done"
                action={actionMarkAsDone}
              />

              <HoverButton
                label="Mark repository as read"
                icon={ReadIcon}
                testid="repository-mark-as-read"
                action={actionMarkAsRead}
              />

              <HoverButton
                label={Chevron.label}
                icon={Chevron.icon}
                testid="repository-toggle"
                action={actionToggleRepositoryNotifications}
              />
            </HoverGroup>
          )}
        </Stack>
      </Box>

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
