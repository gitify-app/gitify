import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronUpIcon,
} from '@primer/octicons-react';
import { type FC, type MouseEvent, useContext, useState } from 'react';
import { AppContext } from '../context/App';
import { type Account, type GitifyError, Opacity, Size } from '../types';
import type { Notification } from '../typesGitHub';
import { cn } from '../utils/cn';
import { openAccountProfile } from '../utils/links';
import { AllRead } from './AllRead';
import { HoverGroup } from './HoverGroup';
import { NotificationRow } from './NotificationRow';
import { Oops } from './Oops';
import { RepositoryNotifications } from './RepositoryNotifications';
import { InteractionButton } from './buttons/InteractionButton';
import { PlatformIcon } from './icons/PlatformIcon';

interface IAccountNotifications {
  account: Account;
  notifications: Notification[];
  error: GitifyError | null;
  showAccountHostname: boolean;
}

export const AccountNotifications: FC<IAccountNotifications> = (
  props: IAccountNotifications,
) => {
  const { account, showAccountHostname, notifications } = props;

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
      {showAccountHostname && (
        <div
          className={cn(
            'group flex items-center justify-between px-3 py-1.5 text-sm font-semibold',
            'bg-gray-300 dark:bg-gray-darkest dark:text-white',
            Opacity.LOW,
          )}
          onClick={toggleAccountNotifications}
        >
          <div className="flex">
            <div className="mr-3 flex items-center justify-center">
              <PlatformIcon type={account.platform} size={Size.MEDIUM} />
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
          {props.error ? (
            <Oops error={props.error} />
          ) : (
            props.notifications.length === 0 && <AllRead />
          )}
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
