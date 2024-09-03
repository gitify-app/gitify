import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronUpIcon,
  FeedPersonIcon,
  GitPullRequestIcon,
  IssueOpenedIcon,
} from '@primer/octicons-react';
import { type FC, type MouseEvent, useContext, useMemo, useState } from 'react';
import { AppContext } from '../context/App';
import { type Account, type GitifyError, Opacity, Size } from '../types';
import type { Notification } from '../typesGitHub';
import { cn } from '../utils/cn';
import {
  openAccountProfile,
  openBitbucketPulls,
  openGitHubIssues,
  openGitHubPulls,
} from '../utils/links';
import { AllRead } from './AllRead';
import { HoverGroup } from './HoverGroup';
import { NotificationRow } from './NotificationRow';
import { Oops } from './Oops';
import { RepositoryNotifications } from './RepositoryNotifications';
import { InteractionButton } from './buttons/InteractionButton';
import { AvatarIcon } from './icons/AvatarIcon';
import { PlatformIcon } from './icons/PlatformIcon';

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

  const ChevronIcon =
    notifications.length === 0
      ? ChevronLeftIcon
      : showAccountNotifications
        ? ChevronDownIcon
        : ChevronUpIcon;

  const toggleAccountNotificationsLabel =
    notifications.length === 0
      ? 'No notifications for account'
      : showAccountNotifications
        ? 'Hide account notifications'
        : 'Show account notifications';

  const groupByRepository = settings.groupBy === 'REPOSITORY';

  return (
    <>
      {showAccountHeader && (
        <div
          className={cn(
            'group flex items-center justify-between px-3 py-1.5 text-sm font-semibold dark:text-white',
            props.error
              ? 'bg-red-300 dark:bg-red-500'
              : 'bg-gray-300 dark:bg-gray-darkest',
            Opacity.LOW,
          )}
          onClick={toggleAccountNotifications}
        >
          <div className="flex">
            <div className="mr-2 flex items-center justify-center">
              <AvatarIcon
                title={account.user.login}
                url={account.user.avatar}
                size={Size.SMALL}
                defaultIcon={FeedPersonIcon}
              />
            </div>
            <button
              type="button"
              title="Open Profile"
              onClick={(event: MouseEvent<HTMLElement>) => {
                // Don't trigger onClick of parent element.
                event.stopPropagation();
                openAccountProfile(account);
              }}
            >
              @{account.user.login}
            </button>
          </div>
          <HoverGroup>
            <PlatformIcon type={account.platform} size={Size.SMALL} />
            {account.platform !== 'Bitbucket Cloud' && (
              <InteractionButton
                title="My Issues"
                icon={IssueOpenedIcon}
                size={Size.SMALL}
                onClick={(event: MouseEvent<HTMLElement>) => {
                  // Don't trigger onClick of parent element.
                  event.stopPropagation();
                  openGitHubIssues(account.hostname);
                }}
              />
            )}
            <InteractionButton
              title="My Pull Requests"
              icon={GitPullRequestIcon}
              size={Size.SMALL}
              onClick={(event: MouseEvent<HTMLElement>) => {
                // Don't trigger onClick of parent element.
                event.stopPropagation();
                if (account.platform === 'Bitbucket Cloud') {
                  openBitbucketPulls(account);
                } else {
                  openGitHubPulls(account.hostname);
                }
              }}
            />
            <InteractionButton
              title={toggleAccountNotificationsLabel}
              icon={ChevronIcon}
              size={Size.SMALL}
              onClick={toggleAccountNotifications}
            />
          </HoverGroup>
        </div>
      )}

      {showAccountNotifications && (
        <>
          {props.error && <Oops error={props.error} />}
          {!hasNotifications && !props.error && <AllRead />}
          {groupByRepository
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
