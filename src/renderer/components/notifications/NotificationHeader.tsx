import type { FC, MouseEvent } from 'react';

import { Stack } from '@primer/react';

import { useAppContext } from '../../context/App';
import { type GitifyNotification, Opacity, Size } from '../../types';
import { cn } from '../../utils/cn';
import { openRepository } from '../../utils/links';
import { isGroupByDate } from '../../utils/notifications/group';
import { AvatarWithFallback } from '../avatars/AvatarWithFallback';

interface NotificationHeaderProps {
  notification: GitifyNotification;
}

export const NotificationHeader: FC<NotificationHeaderProps> = ({
  notification,
}: NotificationHeaderProps) => {
  const { settings } = useAppContext();

  const repoSlug = notification.repository.fullName;

  const notificationNumber = notification.subject?.number
    ? `#${notification.subject.number}`
    : '';

  return (
    isGroupByDate(settings) && (
      <div className="py-0.5">
        <Stack align="center" direction="horizontal" gap="condensed">
          <button
            className="text-xs font-medium"
            data-testid="view-repository"
            onClick={(event: MouseEvent<HTMLElement>) => {
              // Don't trigger onClick of parent element.
              event.stopPropagation();
              openRepository(notification.repository);
            }}
            title="Open repository ↗"
            type="button"
          >
            <AvatarWithFallback
              alt={repoSlug}
              name={repoSlug}
              size={Size.SMALL}
              src={notification.repository.owner.avatarUrl}
              userType={notification.repository.owner.type}
            />
          </button>
          <div
            className={cn(
              'text-xxs',
              Opacity.READ,
              !settings.showNumber && 'hidden',
            )}
          >
            {notificationNumber}
          </div>
        </Stack>
      </div>
    )
  );
};
