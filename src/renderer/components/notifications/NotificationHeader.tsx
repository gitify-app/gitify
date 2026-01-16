import type { FC, MouseEvent } from 'react';

import { Stack } from '@primer/react';

import { useAppContext } from '../../hooks/useAppContext';

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
              alt={notification.repository.fullName}
              name={notification.repository.fullName}
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
            {notification.display.number}
          </div>
        </Stack>
      </div>
    )
  );
};
