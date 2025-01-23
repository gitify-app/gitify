import { type FC, type MouseEvent, useContext, useMemo, useState } from 'react';

import { GitPullRequestIcon, IssueOpenedIcon } from '@primer/octicons-react';
import { Button, IconButton } from '@primer/react';

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

  const [showAccountNotifications, setShowAccountNotifications] =
    useState(true);

  const toggleAccountNotifications = () => {
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
        <div
          className={cn(
            'group flex items-center justify-between pr-1 py-0.5 text-sm font-semibold',
            props.error ? 'bg-gitify-account-error' : 'bg-gitify-account-rest',
          )}
          onClick={toggleAccountNotifications}
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

          <HoverGroup>
            <IconButton
              aria-label="My Issues"
              icon={IssueOpenedIcon}
              size="small"
              variant="invisible"
              onClick={(event: MouseEvent<HTMLElement>) => {
                // Don't trigger onClick of parent element.
                event.stopPropagation();
                openGitHubIssues(account.hostname);
              }}
              data-testid="account-issues"
            />

            <IconButton
              aria-label="My Pull Requests"
              icon={GitPullRequestIcon}
              size="small"
              variant="invisible"
              onClick={(event: MouseEvent<HTMLElement>) => {
                // Don't trigger onClick of parent element.
                event.stopPropagation();
                openGitHubPulls(account.hostname);
              }}
              data-testid="account-pull-requests"
            />

            <IconButton
              aria-label={Chevron.label}
              icon={Chevron.icon}
              size="small"
              variant="invisible"
              onClick={toggleAccountNotifications}
              data-testid="account-toggle"
            />
          </HoverGroup>
        </div>
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
