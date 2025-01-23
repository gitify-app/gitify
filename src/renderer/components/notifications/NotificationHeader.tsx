import { type FC, type MouseEvent, useContext } from 'react';

import { Avatar, Stack, Tooltip } from '@primer/react';

import { AppContext } from '../../context/App';
import { GroupBy, Opacity, Size } from '../../types';
import type { Notification } from '../../typesGitHub';
import { cn } from '../../utils/cn';
import { openRepository } from '../../utils/links';

interface INotificationHeader {
  notification: Notification;
}

export const NotificationHeader: FC<INotificationHeader> = ({
  notification,
}: INotificationHeader) => {
  const { settings } = useContext(AppContext);

  const repoAvatarUrl = notification.repository.owner.avatar_url;
  const repoSlug = notification.repository.full_name;

  const notificationNumber = notification.subject?.number
    ? `#${notification.subject.number}`
    : '';

  const groupByDate = settings.groupBy === GroupBy.DATE;

  return (
    groupByDate && (
      <Tooltip text={`View repository: ${repoSlug}`} direction="se">
        <div
          onClick={(event: MouseEvent<HTMLElement>) => {
            // Don't trigger onClick of parent element.
            event.stopPropagation();
            openRepository(notification.repository);
          }}
          data-testid="view-repository"
        >
          <Stack direction="horizontal" align="center" gap="condensed">
            <Avatar src={repoAvatarUrl} size={Size.SMALL} />
            <span className="text-xs font-medium">{repoSlug}</span>
            <span
              className={cn(
                'text-xxs',
                Opacity.READ,
                !settings.showNumber && 'hidden',
              )}
            >
              {notificationNumber}
            </span>
          </Stack>
        </div>
      </Tooltip>
    )
  );
};
