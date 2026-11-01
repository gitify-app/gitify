import { type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { CheckIcon, ReadIcon } from '@primer/octicons-react';
import { Button, Stack } from '@primer/react';

import { cn } from 'cn';

import { useNotificationActions } from '../../hooks/notifications/useNotificationActions';

import { HoverButton } from '../primitives/HoverButton';
import { HoverGroup } from '../primitives/HoverGroup';

import { type GitifyNotification, Opacity, Size } from '../../types';

import { isMarkAsDoneFeatureSupported } from '../../utils/api/features';
import { shouldRemoveNotificationsFromState } from '../../utils/notifications/remove';
import { openRepository } from '../../utils/system/links';
import { getChevronDetails } from '../../utils/ui/display';
import { getChevronIcon } from '../../utils/ui/icons';
import { AvatarWithFallback } from '../avatars/AvatarWithFallback';
import { ExitCollapse } from './ExitCollapse';

export interface RepositoryHeaderProps {
  repoNotifications: GitifyNotification[];
  repoName: string;
  isCollapsed: boolean;
  isAnimatingExit: boolean;
  onToggle: () => void;
  onAnimateExit: (animate: boolean) => void;
}

export function RepositoryHeader({
  repoName,
  repoNotifications,
  isCollapsed,
  isAnimatingExit,
  onToggle,
  onAnimateExit,
}: Readonly<RepositoryHeaderProps>) {
  const { t } = useTranslation();
  const { markNotificationsAsRead, markNotificationsAsDone } = useNotificationActions();

  const shouldAnimateExit = shouldRemoveNotificationsFromState();

  const runGroupAction = async (action: () => Promise<boolean>) => {
    onAnimateExit(shouldAnimateExit);
    try {
      await action();
    } finally {
      onAnimateExit(false);
    }
  };

  const areAllRepoNotificationsRead = repoNotifications.every(
    (notification) => !notification.unread,
  );

  const chevron = getChevronDetails(true, !isCollapsed, 'repository');

  return (
    <ExitCollapse isExiting={isAnimatingExit}>
      <Stack
        className={cn(
          'group relative pr-1 py-0.5',
          'bg-gitify-repository',
          'min-h-0 min-w-0',
          areAllRepoNotificationsRead && Opacity.READ,
        )}
        direction="horizontal"
        onClick={onToggle}
      >
        <Button
          alignContent="center"
          aria-label={`Open repository ${repoName}`}
          count={repoNotifications.length}
          data-testid="open-repository"
          onClick={(event: MouseEvent<HTMLElement>) => {
            // Don't trigger onClick of parent element.
            event.stopPropagation();
            openRepository(repoNotifications[0].repository);
          }}
          title={t('repository.open', 'Open repository ↗')}
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
              label={t('repository.mark_as_read', 'Mark repository as read')}
              testid="repository-mark-as-read"
            />

            <HoverButton
              action={() => runGroupAction(() => markNotificationsAsDone(repoNotifications))}
              enabled={
                isMarkAsDoneFeatureSupported(repoNotifications[0].account) &&
                !areAllRepoNotificationsRead
              }
              icon={CheckIcon}
              label={t('repository.mark_as_done', 'Mark repository as done')}
              testid="repository-mark-as-done"
            />

            <HoverButton
              action={onToggle}
              icon={getChevronIcon(chevron.direction)}
              label={chevron.label}
              testid="repository-toggle"
            />
          </HoverGroup>
        )}
      </Stack>
    </ExitCollapse>
  );
}
