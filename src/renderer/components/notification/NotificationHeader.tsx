import { Avatar } from '@primer/react';
import { type FC, type MouseEvent, useContext } from 'react';
import { AppContext } from '../../context/App';
import { Opacity, Size } from '../../types';
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

  const groupByDate = settings.groupBy === 'DATE';

  return (
    groupByDate && (
      <div
        className={cn(
          'mb-1 flex items-center gap-1 text-xs font-medium',
          Opacity.MEDIUM,
        )}
      >
        <span>
          <Avatar src={repoAvatarUrl} title={repoSlug} size={Size.SMALL} />
        </span>
        <span
          title={repoSlug}
          className="cursor-pointer truncate opacity-90"
          onClick={(event: MouseEvent<HTMLElement>) => {
            // Don't trigger onClick of parent element.
            event.stopPropagation();
            openRepository(notification.repository);
          }}
        >
          {repoSlug}
        </span>
      </div>
    )
  );
};
