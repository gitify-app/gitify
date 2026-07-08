import type { FC, MouseEvent } from 'react';

import { RelativeTime, Stack, Text } from '@primer/react';

import {
  type GitifyNotification,
  type GitifyNotificationUser,
  type SubjectType,
  Opacity,
  Size,
} from '../../types';

import { openUserProfile } from '../../utils/system/links';
import { cn } from '../../utils/ui/cn';
import { AvatarWithFallback } from '../avatars/AvatarWithFallback';
import { MetricGroup } from '../metrics/MetricGroup';

export interface NotificationFooterProps {
  notification: GitifyNotification;
}

const subjectTypesWithVisibleAuthor: SubjectType[] = ['Issue', 'PullRequest'];

function getVisibleAuthor(notification: GitifyNotification): GitifyNotificationUser | undefined {
  if (!subjectTypesWithVisibleAuthor.includes(notification.subject.type)) {
    return undefined;
  }

  return notification.subject.author;
}

interface NotificationTimestampProps {
  notification: GitifyNotification;
}

const NotificationTimestamp: FC<NotificationTimestampProps> = ({
  notification,
}: NotificationTimestampProps) => (
  <Stack direction="horizontal" gap="none">
    <Text className="pr-1" title={notification.reason.description}>
      {notification.reason.title}
    </Text>
    <RelativeTime datetime={notification.updatedAt} />
  </Stack>
);

interface NotificationAuthorProps {
  author: GitifyNotificationUser;
}

const NotificationAuthor: FC<NotificationAuthorProps> = ({ author }: NotificationAuthorProps) => (
  <button
    className="hidden font-medium hover:underline group-hover:inline"
    data-testid="view-author-profile"
    onClick={(event: MouseEvent<HTMLElement>) => {
      // Don't trigger onClick of parent element.
      event.stopPropagation();
      openUserProfile(author);
    }}
    title={`Open ${author.login}'s profile ↗`}
    type="button"
  >
    {`by ${author.login}`}
  </button>
);

export const NotificationFooter: FC<NotificationFooterProps> = ({
  notification,
}: NotificationFooterProps) => {
  const author = getVisibleAuthor(notification);

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
            openUserProfile(notification.subject.user!);
          }}
          title={notification.subject.user.login}
          type="button"
        >
          <AvatarWithFallback
            alt={notification.subject.user.login}
            size={Size.SMALL}
            src={notification.subject.user.avatarUrl}
            userType={notification.subject.user.type}
          />
        </button>
      ) : (
        <AvatarWithFallback size={Size.SMALL} userType={notification.display.defaultUserType} />
      )}

      {author ? (
        <Stack direction="horizontal" gap="condensed">
          <NotificationTimestamp notification={notification} />
          <NotificationAuthor author={author} />
        </Stack>
      ) : (
        <NotificationTimestamp notification={notification} />
      )}

      <MetricGroup notification={notification} />
    </Stack>
  );
};
