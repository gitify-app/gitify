import type { FC, MouseEvent } from 'react';

import { RelativeTime, Stack, Text } from '@primer/react';

import { Opacity, Size } from '../../types';
import type { Notification } from '../../typesGitHub';
import { cn } from '../../utils/cn';
import { openUserProfile } from '../../utils/links';
import { getReasonDetails } from '../../utils/reason';
import { AvatarWithFallback } from '../avatars/AvatarWithFallback';
import { MetricGroup } from '../metrics/MetricGroup';

interface NotificationFooterProps {
  notification: Notification;
}

export const NotificationFooter: FC<NotificationFooterProps> = ({
  notification,
}: NotificationFooterProps) => {
  const reason = getReasonDetails(notification.reason);

  return (
    <Stack
      align="center"
      className={cn('text-xs', Opacity.MEDIUM)}
      direction="horizontal"
      gap="condensed"
      wrap="wrap"
    >
      {notification.subject.user ? (
        <button
          data-testid="view-profile"
          onClick={(event: MouseEvent<HTMLElement>) => {
            // Don't trigger onClick of parent element.
            event.stopPropagation();
            openUserProfile(notification.subject.user);
          }}
          title={notification.subject.user.login}
          type="button"
        >
          <AvatarWithFallback
            alt={notification.subject.user.login}
            size={Size.SMALL}
            src={notification.subject.user.avatar_url}
            userType={notification.subject.user.type}
          />
        </button>
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
        <Text className="pr-1" title={reason.description}>
          {reason.title}
        </Text>
        <RelativeTime datetime={notification.updated_at} />
      </Stack>

      <MetricGroup notification={notification} />
    </Stack>
  );
};
