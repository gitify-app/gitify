import { type FC, type MouseEvent } from 'react';

import { CheckIcon, ReadIcon } from '@primer/octicons-react';
import { Button, Stack } from '@primer/react';

import { cn } from 'cn';

import { useNotifications } from '../../hooks/useNotifications';
import { getNotificationFailureKey, useNotificationActionFailuresStore } from '../../stores';

import { HoverButton } from '../primitives/HoverButton';
import { HoverGroup } from '../primitives/HoverGroup';

import { type GitifyNotification, Opacity, Size } from '../../types';

import { isMarkAsDoneFeatureSupported } from '../../utils/api/features';
import { shouldRemoveNotificationsFromState } from '../../utils/notifications/remove';
import { openRepository } from '../../utils/system/links';
import { getChevronDetails } from '../../utils/ui/display';
import { AvatarWithFallback } from '../avatars/AvatarWithFallback';

export interface RepositoryHeaderProps {
  repoNotifications: GitifyNotification[];
  repoName: string;
  isCollapsed: boolean;
  isAnimatingExit: boolean;
  onToggle: () => void;
  onAnimateExit: (animate: boolean) => void;
}

export const RepositoryHeader: FC<RepositoryHeaderProps> = ({
  repoName,
  repoNotifications,
  isCollapsed,
  isAnimatingExit,
  onToggle,
  onAnimateExit,
}) => {
  const { markNotificationsAsRead, markNotificationsAsDone } = useNotifications();

  const shouldAnimateExit = shouldRemoveNotificationsFromState();

  // Successful actions clear when their rows disappear; failures must clear here.
  const runGroupAction = async (action: () => Promise<void>) => {
    onAnimateExit(shouldAnimateExit);

    await action();

    const { failures } = useNotificationActionFailuresStore.getState();
    const hasFailure = repoNotifications.some(
      (notification) => failures[getNotificationFailureKey(notification.account, notification.id)],
    );

    if (hasFailure) {
      onAnimateExit(false);
    }
  };

  const areAllRepoNotificationsRead = repoNotifications.every(
    (notification) => !notification.unread,
  );

  const Chevron = getChevronDetails(true, !isCollapsed, 'repository');

  return (
    <Stack
      className={cn(
        'group relative pr-1 py-0.5',
        'bg-gitify-repository',
        isAnimatingExit && 'translate-x-full opacity-0 transition duration-350 ease-in-out',
        areAllRepoNotificationsRead && Opacity.READ,
      )}
      direction="horizontal"
      onClick={onToggle}
    >
      <Button
        alignContent="center"
        count={repoNotifications.length}
        data-testid="open-repository"
        onClick={(event: MouseEvent<HTMLElement>) => {
          // Don't trigger onClick of parent element.
          event.stopPropagation();
          openRepository(repoNotifications[0].repository);
        }}
        title="Open repository ↗"
        variant="invisible"
      >
        <AvatarWithFallback
          alt={repoName}
          name={repoName}
          size={Size.LARGE}
          src={repoNotifications[0].repository.owner.avatarUrl}
          userType={repoNotifications[0].repository.owner.type}
        />
      </Button>

      {!isAnimatingExit && (
        <HoverGroup bgColor="group-hover:bg-gitify-repository">
          <HoverButton
            action={() => runGroupAction(() => markNotificationsAsRead(repoNotifications))}
            enabled={!areAllRepoNotificationsRead}
            icon={ReadIcon}
            label="Mark repository as read"
            testid="repository-mark-as-read"
          />

          <HoverButton
            action={() => runGroupAction(() => markNotificationsAsDone(repoNotifications))}
            enabled={
              isMarkAsDoneFeatureSupported(repoNotifications[0].account) &&
              !areAllRepoNotificationsRead
            }
            icon={CheckIcon}
            label="Mark repository as done"
            testid="repository-mark-as-done"
          />

          <HoverButton
            action={onToggle}
            icon={Chevron.icon}
            label={Chevron.label}
            testid="repository-toggle"
          />
        </HoverGroup>
      )}
    </Stack>
  );
};
