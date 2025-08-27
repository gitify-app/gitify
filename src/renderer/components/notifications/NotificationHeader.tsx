import { type FC, type MouseEvent, useContext } from 'react';

import { Box, Stack } from '@primer/react';

import { AppContext } from '../../context/App';
import { GroupBy, Opacity, Size } from '../../types';
import type { Notification } from '../../typesGitHub';
import { cn } from '../../utils/cn';
import { openRepository } from '../../utils/links';
import { AvatarWithFallback } from '../avatars/AvatarWithFallback';

interface INotificationHeader {
  notification: Notification;
}

export const NotificationHeader: FC<INotificationHeader> = ({
  notification,
}: INotificationHeader) => {
  const { settings } = useContext(AppContext);

  const repoSlug = notification.repository.full_name;

  const notificationNumber = notification.subject?.number
    ? `#${notification.subject.number}`
    : '';

  const groupByDate = settings.groupBy === GroupBy.DATE;

  return (
    groupByDate && (
      <Box className="py-0.5">
        <Stack align="center" direction="horizontal" gap="condensed">
          <Box
            className="text-xs font-medium"
            data-testid="view-repository"
            onClick={(event: MouseEvent<HTMLElement>) => {
              // Don't trigger onClick of parent element.
              event.stopPropagation();
              openRepository(notification.repository);
            }}
            title="Open repository"
          >
            <AvatarWithFallback
              alt={repoSlug}
              name={repoSlug}
              size={Size.SMALL}
              src={notification.repository.owner.avatar_url}
              userType={notification.repository.owner.type}
            />
          </Box>
          <Box
            className={cn(
              'text-xxs',
              Opacity.READ,
              !settings.showNumber && 'hidden',
            )}
          >
            {notificationNumber}
          </Box>
        </Stack>
      </Box>
    )
  );
};
