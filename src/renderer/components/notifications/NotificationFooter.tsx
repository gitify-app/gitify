import type { MouseEvent } from 'react';

import { RelativeTime, Stack, Text } from '@primer/react';

import { cn } from 'cn';

import { type GitifyNotification, Opacity, Size } from '../../types';

import { getAccountAdapter } from '../../utils/forges/registry';
import { openUserProfile } from '../../utils/system/links';
import { AvatarWithFallback } from '../avatars/AvatarWithFallback';
import { MetricGroup } from '../metrics/MetricGroup';

export interface NotificationFooterProps {
  notification: GitifyNotification;
}

export function NotificationFooter({ notification }: Readonly<NotificationFooterProps>) {
  const user = notification.subject.user;
  const userLabel = user
    ? getAccountAdapter(notification.account).formatNotificationUser(user)
    : undefined;

  return (
    // Reserve the action rail's width on a plain wrapper: Primer's `Stack`
    // emits `data-padding="none"`, whose `padding-inline: 0` outranks a Tailwind
    // `pr-*` utility on the same element. Without this, the pills run under the
    // full-height hover rail and their tooltips become unreachable.
    <div className="pr-[5.5rem]">
      <Stack
        align="center"
        // The title line and number stay full width; only the footer/pill strip
        // yields, so pills wrap clear of the action rail.
        className={cn('text-xs', Opacity.MEDIUM)}
        direction="horizontal"
        gap="condensed"
        wrap="wrap"
      >
        {user ? (
          <button
            data-testid="view-profile"
            onClick={(event: MouseEvent<HTMLElement>) => {
              // Don't trigger onClick of parent element.
              event.stopPropagation();
              openUserProfile(user);
            }}
            title={userLabel}
            type="button"
          >
            <AvatarWithFallback
              alt={userLabel}
              size={Size.SMALL}
              src={user.avatarUrl}
              userType={user.type}
            />
          </button>
        ) : (
          <AvatarWithFallback
            icon={notification.display.defaultUserIcon}
            size={Size.SMALL}
            userType={notification.display.defaultUserType}
          />
        )}

        <Stack direction="horizontal" gap="none">
          <Text className="pr-1" title={notification.reason.description}>
            {notification.reason.title}
          </Text>
          <RelativeTime datetime={notification.updatedAt} />
        </Stack>

        <MetricGroup notification={notification} />
      </Stack>
    </div>
  );
}
