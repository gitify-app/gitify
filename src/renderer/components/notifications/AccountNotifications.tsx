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
import { Oops } from '../Oops';
import { AvatarWithFallback } from '../avatars/AvatarWithFallback';
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

            <HoverGroup bgColor="bg-gitify-account-rest">
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
