import type { FC, MouseEvent } from 'react';

import { FeedPersonIcon, MarkGithubIcon } from '@primer/octicons-react';
import { Avatar } from '@primer/react';

import { IconColor, Opacity, Size } from '../../types';
import type { Notification } from '../../typesGitHub';
import { cn } from '../../utils/cn';
import {
  formatNotificationUpdatedAt,
  isNonHumanUser,
} from '../../utils/helpers';
import { openUserProfile } from '../../utils/links';
import { formatReason } from '../../utils/reason';
import { Pills } from './Pills';

interface INotificationFooter {
  notification: Notification;
}

export const NotificationFooter: FC<INotificationFooter> = ({
  notification,
}: INotificationFooter) => {
  const reason = formatReason(notification.reason);

  const updatedAt = formatNotificationUpdatedAt(notification);
  const updatedLabel = notification.subject.user
    ? `${notification.subject.user.login} updated ${updatedAt}`
    : `Updated ${updatedAt}`;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {notification.subject.user ? (
        <Avatar
          title={`View profile: ${notification.subject.user.login}`}
          src={notification.subject.user.avatar_url}
          size={Size.SMALL}
          square={isNonHumanUser(notification.subject.user.type)}
          onClick={(event: MouseEvent<HTMLElement>) => {
            // Don't trigger onClick of parent element.
            event.stopPropagation();
            openUserProfile(notification.subject.user);
          }}
          data-testid="view-profile"
        />
      ) : (
        <>
          {notification.subject.type === 'RepositoryDependabotAlertsThread' ||
          notification.subject.type === 'RepositoryVulnerabilityAlert' ? (
            <MarkGithubIcon size={Size.SMALL} />
          ) : (
            <FeedPersonIcon size={Size.SMALL} className={IconColor.GRAY} />
          )}
        </>
      )}
      <span
        className={cn('text-xs capitalize', Opacity.MEDIUM)}
        title={reason.description}
      >
        {reason.title}
      </span>
      <span
        className={cn('text-xs capitalize', Opacity.MEDIUM)}
        title={updatedLabel}
      >
        {updatedAt}
      </span>
      <Pills notification={notification} />
    </div>
  );
};
