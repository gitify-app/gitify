import { FeedPersonIcon, MarkGithubIcon } from '@primer/octicons-react';
import type { FC } from 'react';
import { IconColor, Opacity, Size } from '../../types';
import type { Notification } from '../../typesGitHub';
import { cn } from '../../utils/cn';
import { formatNotificationUpdatedAt } from '../../utils/helpers';
import { userProfileURL } from '../../utils/links';
import { formatReason } from '../../utils/reason';
import { AvatarIcon } from '../icons/AvatarIcon';
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
    <div
      className={cn(
        'flex flex-wrap items-center gap-1 text-xs capitalize',
        Opacity.MEDIUM,
      )}
    >
      {notification.subject.user ? (
        <a href={userProfileURL(notification.subject.user)}>
          <button
            type="button"
            title="View User Profile"
            className="flex-shrink-0"
          >
            <AvatarIcon
              title={notification.subject.user.login}
              url={notification.subject.user.avatar_url}
              size={Size.XSMALL}
              defaultIcon={FeedPersonIcon}
            />
          </button>
        </a>
      ) : (
        <div>
          {notification.subject.type === 'RepositoryDependabotAlertsThread' ||
          notification.subject.type === 'RepositoryVulnerabilityAlert' ? (
            <MarkGithubIcon size={Size.MEDIUM} />
          ) : (
            <FeedPersonIcon size={Size.MEDIUM} className={IconColor.GRAY} />
          )}
        </div>
      )}
      <div title={reason.description}>{reason.title}</div>
      <div title={updatedLabel}>{updatedAt}</div>
      <Pills notification={notification} />
    </div>
  );
};
