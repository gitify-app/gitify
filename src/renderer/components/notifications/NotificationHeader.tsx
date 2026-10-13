import type { FC, MouseEvent } from 'react';

import { Stack } from '@primer/react';

import { cn } from 'cn';

import { useSettingsStore } from '../../stores';

import { PreviewCard } from '../primitives/PreviewCard';

import { type GitifyNotification, type Link, Opacity, Size } from '../../types';

import { isGroupByDate } from '../../utils/notifications/group';
import { openRepository } from '../../utils/system/links';
import { AvatarWithFallback } from '../avatars/AvatarWithFallback';
import { ProfileCard } from '../previews/ProfileCard';

export interface NotificationHeaderProps {
  notification: GitifyNotification;
}

export const NotificationHeader: FC<NotificationHeaderProps> = ({
  notification,
}: NotificationHeaderProps) => {
  const showNumber = useSettingsStore((s) => s.showNumber);
  const detailedNotifications = useSettingsStore((s) => s.detailedNotifications);

  const owner = notification.repository.owner;
  const ownerProfileUrl = `${new URL(notification.repository.htmlUrl).origin}/${owner.login}`;

  const repositoryButton = (
    <button
      className="text-xs font-medium"
      data-testid="view-repository"
      onClick={(event: MouseEvent<HTMLElement>) => {
        // Don't trigger onClick of parent element.
        event.stopPropagation();
        openRepository(notification.repository);
      }}
      title="Open repository ↗"
      type="button"
    >
      <AvatarWithFallback
        alt={notification.repository.fullName}
        name={notification.repository.fullName}
        size={Size.SMALL}
        src={notification.repository.owner.avatarUrl}
        userType={notification.repository.owner.type}
      />
    </button>
  );

  return (
    isGroupByDate() && (
      <div className="py-0.5">
        <Stack align="center" direction="horizontal" gap="condensed">
          {detailedNotifications ? (
            <PreviewCard
              ariaLabel={`Preview owner: ${owner.login}`}
              card={
                <ProfileCard
                  avatarUrl={owner.avatarUrl}
                  bio={owner.bio}
                  company={owner.company}
                  description={owner.description}
                  followersCount={owner.followersCount}
                  location={owner.location}
                  login={owner.login}
                  profileUrl={ownerProfileUrl as Link}
                  type={owner.type}
                  websiteUrl={owner.websiteUrl}
                />
              }
              testId="owner-preview"
            >
              {repositoryButton}
            </PreviewCard>
          ) : (
            repositoryButton
          )}
          <div className={cn('text-xxs', Opacity.READ, !showNumber && 'hidden')}>
            {notification.display.number}
          </div>
        </Stack>
      </div>
    )
  );
};
