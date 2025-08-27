import { type FC, type MouseEvent, useContext, useMemo, useState } from 'react';

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

  const groupedNotifications = Object.values(
    notifications.reduce(
      (acc: { [key: string]: Notification[] }, notification) => {
        const key = notification.repository.full_name;
        if (!acc[key]) acc[key] = [];
        acc[key].push(notification);
        return acc;
      },
      {},
    ),
  );

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
            align="center"
            className="relative"
            direction="horizontal"
            gap="condensed"
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
                label="My Issues"
                testid="account-issues"
              />

              <HoverButton
                action={() => openGitHubPulls(account.hostname)}
                icon={GitPullRequestIcon}
                label="My Pull Requests"
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
        </Box>
      )}

      {showAccountNotifications && (
        <>
          {props.error && <Oops error={props.error} fullHeight={false} />}
          {!hasNotifications && !props.error && <AllRead fullHeight={false} />}
          {isGroupByRepository
            ? Object.values(groupedNotifications).map((repoNotifications) => {
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
