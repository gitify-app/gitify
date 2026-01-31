import { type FC, type MouseEvent, useMemo, useState } from 'react';

import { GitPullRequestIcon, IssueOpenedIcon } from '@primer/octicons-react';
import { Button, Stack } from '@primer/react';

import { useAppContext } from '../../hooks/useAppContext';

import { HoverButton } from '../primitives/HoverButton';
import { HoverGroup } from '../primitives/HoverGroup';

import {
  type Account,
  type GitifyError,
  type GitifyNotification,
  Size,
} from '../../types';

import { hasMultipleAccounts } from '../../utils/auth/utils';
import { cn } from '../../utils/cn';
import { getChevronDetails } from '../../utils/helpers';
import {
  openAccountProfile,
  openGitHubIssues,
  openGitHubPulls,
  openNotification,
  openRepository,
} from '../../utils/links';
import {
  groupNotificationsByRepository,
  isGroupByRepository,
} from '../../utils/notifications/group';
import { shouldRemoveNotificationsFromState } from '../../utils/notifications/remove';
import { AllRead } from '../AllRead';
import { AvatarWithFallback } from '../avatars/AvatarWithFallback';
import { Oops } from '../Oops';
import { NotificationRow } from './NotificationRow';
import { RepositoryNotifications } from './RepositoryNotifications';

export interface AccountNotificationsProps {
  account: Account;
  notifications: GitifyNotification[];
  error: GitifyError | null;
  showAccountHeader: boolean;
}

export const AccountNotifications: FC<AccountNotificationsProps> = (
  props: AccountNotificationsProps,
) => {
  const { account, showAccountHeader, notifications } = props;

  const {
    auth,
    settings,
    markNotificationsAsRead,
    markNotificationsAsDone,
    unsubscribeNotification,
  } = useAppContext();

  const [isAccountNotificationsVisible, setIsAccountNotificationsVisible] =
    useState(true);

  const [pendingNotificationRemovals, setPendingNotificationRemovals] =
    useState<Set<string>>(new Set());

  const ANIMATION_MS = 500;

  const scheduleNotificationRemoval = (
    notificationsToRemove: GitifyNotification[],
    action: 'read' | 'done' | 'unsubscribe' = 'read',
  ) => {
    const ids = notificationsToRemove.map((n) => n.id);
    const shouldAnimate = shouldRemoveNotificationsFromState(settings);

    if (shouldAnimate) {
      setPendingNotificationRemovals((prev) => {
        const s = new Set(prev);
        ids.forEach((id) => s.add(id));
        return s;
      });

      setTimeout(() => {
        if (action === 'done') {
          markNotificationsAsDone(notificationsToRemove);
        } else if (action === 'read') {
          markNotificationsAsRead(notificationsToRemove);
        } else if (action === 'unsubscribe') {
          notificationsToRemove.forEach((n) => unsubscribeNotification(n));
        }

        setPendingNotificationRemovals((prev) => {
          const s = new Set(prev);
          ids.forEach((id) => s.delete(id));
          return s;
        });
      }, ANIMATION_MS);
    } else {
      if (action === 'done') markNotificationsAsDone(notificationsToRemove);
      else if (action === 'read')
        markNotificationsAsRead(notificationsToRemove);
      else if (action === 'unsubscribe')
        notificationsToRemove.forEach((n) => unsubscribeNotification(n));
    }
  };

  const sortedNotifications = useMemo(
    () => [...notifications].sort((a, b) => a.order - b.order),
    [notifications],
  );

  // single id-array based handler for actions
  const handleNotificationActionIds = (
    ids: string[],
    action:
      | 'read'
      | 'done'
      | 'unsubscribe'
      | 'openNotification'
      | 'openRepository' = 'read',
  ) => {
    const notifs = sortedNotifications.filter((n) => ids.includes(n.id));

    let scheduleAction = action;

    if (action === 'openNotification') {
      scheduleAction = settings.markAsDoneOnOpen ? 'done' : 'read';
    }

    scheduleNotificationRemoval(
      notifs,
      scheduleAction as 'read' | 'done' | 'unsubscribe',
    );

    if (action === 'openNotification') {
      openNotification(notifs[0]);
    }

    if (action === 'openRepository') {
      openRepository(notifs[0].repository);
    }
  };

  const groupedNotifications = useMemo(() => {
    const map = groupNotificationsByRepository(sortedNotifications);

    return Array.from(map.entries());
  }, [sortedNotifications]);

  const hasNotifications = useMemo(
    () => notifications.length > 0,
    [notifications],
  );

  const actionToggleAccountNotifications = () => {
    setIsAccountNotificationsVisible(!isAccountNotificationsVisible);
  };

  const Chevron = getChevronDetails(
    hasNotifications,
    isAccountNotificationsVisible,
    'account',
  );

  return (
    <>
      {showAccountHeader && (
        <Stack
          className={cn(
            'group relative pr-1 py-0.5',
            props.error ? 'bg-gitify-account-error' : 'bg-gitify-account-rest',
          )}
          direction="horizontal"
          onClick={actionToggleAccountNotifications}
        >
          <Button
            alignContent="center"
            count={notifications.length}
            data-testid="account-profile"
            onClick={(event: MouseEvent<HTMLElement>) => {
              // Don't trigger onClick of parent element.
              event.stopPropagation();
              openAccountProfile(account);
            }}
            title="Open account profile"
            variant="invisible"
          >
            <AvatarWithFallback
              alt={account.user.login}
              name={`@${account.user.login}`}
              size={Size.MEDIUM}
              src={account.user.avatar}
            />
          </Button>

          <HoverGroup bgColor="group-hover:bg-gitify-account-rest">
            <HoverButton
              action={() => openGitHubIssues(account.hostname)}
              icon={IssueOpenedIcon}
              label="My issues ↗"
              testid="account-issues"
            />

            <HoverButton
              action={() => openGitHubPulls(account.hostname)}
              icon={GitPullRequestIcon}
              label="My pull requests ↗"
              testid="account-pull-requests"
            />

            <HoverButton
              action={actionToggleAccountNotifications}
              icon={Chevron.icon}
              label={Chevron.label}
              testid="account-toggle"
            />
          </HoverGroup>
        </Stack>
      )}

      {isAccountNotificationsVisible && (
        <>
          {props.error && (
            <Oops error={props.error} fullHeight={!hasMultipleAccounts(auth)} />
          )}

          {!hasNotifications && !props.error && <AllRead fullHeight={false} />}

          {isGroupByRepository(settings)
            ? groupedNotifications.map(([repoSlug, repoNotifications]) => (
                <RepositoryNotifications
                  key={repoSlug}
                  onNotificationActionIds={handleNotificationActionIds}
                  pendingRemovalIds={Array.from(pendingNotificationRemovals)}
                  repoName={repoSlug}
                  repoNotifications={repoNotifications}
                />
              ))
            : sortedNotifications.map((notification) => (
                <NotificationRow
                  isPendingRemoval={pendingNotificationRemovals.has(
                    notification.id,
                  )}
                  key={notification.id}
                  notification={notification}
                  onNotificationActionIds={handleNotificationActionIds}
                />
              ))}
        </>
      )}
    </>
  );
};
