import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronUpIcon,
} from '@primer/octicons-react';
import { type FC, useState } from 'react';
import type { Account } from '../types';
import type { Notification } from '../typesGitHub';
import { openAccountProfile } from '../utils/links';
import { RepositoryNotifications } from './Repository';
import { PlatformIcon } from './icons/PlatformIcon';

interface IAccountNotifications {
  account: Account;
  notifications: Notification[];
  showAccountHostname: boolean;
}

export const AccountNotifications: FC<IAccountNotifications> = (
  props: IAccountNotifications,
) => {
  const { account, showAccountHostname, notifications } = props;

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

  return (
    <>
      {showAccountHostname && (
        <div
          className="group flex items-center justify-between bg-gray-300 px-3 py-2 text-sm font-semibold dark:bg-gray-darkest dark:text-white"
          onClick={toggleAccountNotifications}
        >
          <div className="flex gap-3">
            <PlatformIcon type={account.platform} size={16} />
            <button
              type="button"
              title="Open Profile"
              onClick={() => openAccountProfile(account)}
              className="opacity-80"
            >
              @{account.user.login}
            </button>
          </div>
          <div className="opacity-0 transition-opacity group-hover:opacity-80">
            <button
              type="button"
              className="h-full hover:text-green-500 focus:outline-none"
              title={toggleAccountNotificationsLabel}
              onClick={toggleAccountNotifications}
            >
              <ChevronIcon size={14} />
            </button>
          </div>
        </div>
      )}

      {showAccountNotifications &&
        Object.values(groupedNotifications).map((repoNotifications) => {
          const repoSlug = repoNotifications[0].repository.full_name;

          return (
            <RepositoryNotifications
              key={repoSlug}
              repoName={repoSlug}
              repoNotifications={repoNotifications}
            />
          );
        })}
    </>
  );
};
