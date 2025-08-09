import { type FC, type MouseEvent, useContext, useMemo, useState, useEffect, useRef } from 'react';

import { GitPullRequestIcon, IssueOpenedIcon } from '@primer/octicons-react';
import { Box, Button, Stack } from '@primer/react';

import { AppContext } from '../../context/App';
import { type Account, type GitifyError, Size } from '../../types';
import type { Notification } from '../../typesGitHub';
import { cn } from '../../utils/cn';
import { getChevronDetails } from '../../utils/helpers';
import {
  openAccountProfile,
  openGitHubIssues,
  openGitHubPulls,
} from '../../utils/links';
import { AllRead } from '../AllRead';
import { AvatarWithFallback } from '../avatars/AvatarWithFallback';
import { Oops } from '../Oops';
import { HoverButton } from '../primitives/HoverButton';
import { HoverGroup } from '../primitives/HoverGroup';
import { NotificationRow } from './NotificationRow';
import { RepositoryNotifications } from './RepositoryNotifications';

interface IAccountNotifications {
  account: Account;
  notifications: Notification[];
  error: GitifyError | null;
  showAccountHeader: boolean;
}

export const AccountNotifications: FC<IAccountNotifications> = (
  props: IAccountNotifications,
) => {
  const { account, showAccountHeader, notifications } = props;

  const { settings } = useContext(AppContext);

  const [showAccountNotifications, setShowAccountNotifications] =
    useState(true);


  // Store the order of repo groups as a ref so it persists across re-renders
  const groupOrderRef = useRef<string[]>([]);
  const [groupedNotifications, setGroupedNotifications] = useState<Notification[][]>([]);

  // Helper to group notifications by repo, preserving order
  const groupByRepo = (notifs: Notification[], prevOrder: string[]) => {
    const groups: { [key: string]: Notification[] } = {};
    for (const n of notifs) {
      const key = n.repository.full_name;
      if (!groups[key]) groups[key] = [];
      groups[key].push(n);
    }
    // Preserve previous order, add new repos at the end
    const allKeys = Object.keys(groups);
    const orderedKeys = prevOrder.filter(k => allKeys.includes(k)).concat(allKeys.filter(k => !prevOrder.includes(k)));
    return orderedKeys.map(k => groups[k]);
  };

  // Only update group order when notifications array changes length (i.e., after fetch)
  useEffect(() => {
    // If the number of notifications changes, update group order
    const repoKeys = notifications.map(n => n.repository.full_name);
    const uniqueKeys = Array.from(new Set(repoKeys));
    // If the set of repos changed (e.g., after fetch), update order
    if (
      uniqueKeys.length !== groupOrderRef.current.length ||
      uniqueKeys.some((k, i) => groupOrderRef.current[i] !== k)
    ) {
      groupOrderRef.current = uniqueKeys;
    }
    setGroupedNotifications(groupByRepo(notifications, groupOrderRef.current));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications.length]);

  // When notifications content changes but length doesn't (e.g., marking as read), just regroup with same order
  useEffect(() => {
    setGroupedNotifications(groupByRepo(notifications, groupOrderRef.current));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications]);

  const hasNotifications = useMemo(
    () => notifications.length > 0,
    [notifications],
  );

  const actionToggleAccountNotifications = () => {
    setShowAccountNotifications(!showAccountNotifications);
  };

  const Chevron = getChevronDetails(
    hasNotifications,
    showAccountNotifications,
    'account',
  );

  const isGroupByRepository = settings.groupBy === 'REPOSITORY';

  return (
    <>
      {showAccountHeader && (
        <Box
          className={cn(
            'group pr-1 py-0.5',
            props.error ? 'bg-gitify-account-error' : 'bg-gitify-account-rest',
          )}
          onClick={actionToggleAccountNotifications}
        >
          <Stack
            direction="horizontal"
            align="center"
            gap="condensed"
            className="relative"
          >
            <Button
              title="Open account profile"
              variant="invisible"
              alignContent="center"
              count={notifications.length}
              onClick={(event: MouseEvent<HTMLElement>) => {
                // Don't trigger onClick of parent element.
                event.stopPropagation();
                openAccountProfile(account);
              }}
              data-testid="account-profile"
            >
              <AvatarWithFallback
                src={account.user.avatar}
                alt={account.user.login}
                name={`@${account.user.login}`}
                size={Size.MEDIUM}
              />
            </Button>

            <HoverGroup bgColor="group-hover:bg-gitify-account-rest">
              <HoverButton
                label="My Issues"
                icon={IssueOpenedIcon}
                testid="account-issues"
                action={() => openGitHubIssues(account.hostname)}
              />

              <HoverButton
                label="My Pull Requests"
                icon={GitPullRequestIcon}
                testid="account-pull-requests"
                action={() => openGitHubPulls(account.hostname)}
              />

              <HoverButton
                label={Chevron.label}
                icon={Chevron.icon}
                testid="account-toggle"
                action={actionToggleAccountNotifications}
              />
            </HoverGroup>
          </Stack>
        </Box>
      )}

      {showAccountNotifications && (
        <>
          {props.error && <Oops error={props.error} fullHeight={false} />}
          {!hasNotifications && !props.error && <AllRead fullHeight={false} />}
          {isGroupByRepository
            ? groupedNotifications.map((repoNotifications) => {
                const repoSlug = repoNotifications[0].repository.full_name;
                return (
                  <RepositoryNotifications
                    key={repoSlug}
                    repoName={repoSlug}
                    repoNotifications={repoNotifications}
                  />
                );
              })
            : notifications.map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                />
              ))}
        </>
      )}
    </>
  );
};
