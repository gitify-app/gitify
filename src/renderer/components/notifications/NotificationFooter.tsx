import type { FC, MouseEvent } from 'react';

import { Box, RelativeTime, Stack, Text } from '@primer/react';

import { Opacity, Size } from '../../types';
import type { Notification } from '../../typesGitHub';
import { cn } from '../../utils/cn';
import { openUserProfile } from '../../utils/links';
import { getReasonDetails } from '../../utils/reason';
import { AvatarWithFallback } from '../avatars/AvatarWithFallback';
import { MetricGroup } from '../metrics/MetricGroup';

interface INotificationFooter {
  notification: Notification;
}

export const NotificationFooter: FC<INotificationFooter> = ({
  notification,
}: INotificationFooter) => {
  const reason = getReasonDetails(notification.reason);

  return (
    <Stack
      direction="horizontal"
      align="center"
      gap="condensed"
      wrap="wrap"
      className={cn('text-xs', Opacity.MEDIUM)}
    >
      {notification.subject.user ? (
        <Box
          title={notification.subject.user.login}
          onClick={(event: MouseEvent<HTMLElement>) => {
            // Don't trigger onClick of parent element.
            event.stopPropagation();
            openUserProfile(notification.subject.user);
          }}
          data-testid="view-profile"
        >
          <AvatarWithFallback
            src={notification.subject.user.avatar_url}
            alt={notification.subject.user.login}
            size={Size.SMALL}
            userType={notification.subject.user.type}
          />
        </Box>
      ) : (
        <AvatarWithFallback
          size={Size.SMALL}
          userType={
            notification.subject.type === 'RepositoryDependabotAlertsThread' ||
            notification.subject.type === 'RepositoryVulnerabilityAlert'
              ? 'Bot'
              : 'User'
          }
        />
      )}

      <Stack direction="horizontal" gap="none">
        <Text title={reason.description} className="pr-1">
          {reason.title}
        </Text>
        <RelativeTime datetime={notification.updated_at} />
      </Stack>

      <MetricGroup notification={notification} />
    </Stack>
  );
};
