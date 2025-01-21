import type { FC, MouseEvent } from 'react';

import { FeedPersonIcon, MarkGithubIcon } from '@primer/octicons-react';
import { Avatar, RelativeTime, Stack, Text } from '@primer/react';

import { IconColor, Opacity, Size } from '../../types';
import type { Notification } from '../../typesGitHub';
import { cn } from '../../utils/cn';
import { isNonHumanUser } from '../../utils/helpers';
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

  return (
    <Stack direction="horizontal" align="center" gap="condensed" wrap="wrap">
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
      <span className={cn('text-xs', Opacity.MEDIUM)}>
        <Stack direction="horizontal" gap="condensed">
          <Text title={reason.description}>{reason.title}</Text>
          <Text>&bull;</Text>
          <RelativeTime datetime={notification.updated_at} />
        </Stack>
      </span>

      <Pills notification={notification} />
    </Stack>
  );
};
