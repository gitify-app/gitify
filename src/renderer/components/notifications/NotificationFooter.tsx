import type { FC, MouseEvent } from 'react';

import { FeedPersonIcon, MarkGithubIcon } from '@primer/octicons-react';
import { Avatar, RelativeTime, Stack, Text } from '@primer/react';

import { IconColor, Opacity, Size } from '../../types';
import type { Notification } from '../../typesGitHub';
import { cn } from '../../utils/cn';
import { isNonHumanUser } from '../../utils/helpers';
import { openUserProfile } from '../../utils/links';
import { formatReason } from '../../utils/reason';
import { MetricGroup } from '../metrics/MetricGroup';

interface INotificationFooter {
  notification: Notification;
}

export const NotificationFooter: FC<INotificationFooter> = ({
  notification,
}: INotificationFooter) => {
  const reason = formatReason(notification.reason);

  return (
    <Stack
      direction="horizontal"
      align="center"
      gap="condensed"
      wrap="wrap"
      className={cn('text-xs', Opacity.MEDIUM)}
    >
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

      <Stack direction="horizontal" gap="none">
        <Text title={reason.description}>{reason.title}</Text>
        <Text className="px-1">&bull;</Text>
        <RelativeTime datetime={notification.updated_at} />
      </Stack>

      <MetricGroup notification={notification} />
    </Stack>
  );
};
