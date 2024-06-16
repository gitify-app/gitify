import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronUpIcon,
} from '@primer/octicons-react';
import { useState } from 'react';
import type { Account } from '../types';
import type { Notification } from '../typesGitHub';
import { openAccountProfile } from '../utils/links';
import { RepositoryNotifications } from './Repository';
import { PlatformIcon } from './icons/PlatformIcon';

interface IProps {
  account: Account;
  notifications: Notification[];
  showAccountHostname: boolean;
}

export const AccountNotifications = (props: IProps) => {
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

  const [showNotifications, setShowNotifications] = useState(true);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const ChevronIcon =
    notifications.length === 0
      ? ChevronLeftIcon
      : showNotifications
        ? ChevronDownIcon
        : ChevronUpIcon;

  const toggleNotificationsLabel =
    notifications.length === 0
      ? 'No notifications for account'
      : showNotifications
        ? 'Hide account notifications'
        : 'Show account notifications';

  return (
    <>
      {showAccountHostname && (
        <div className="flex items-center justify-between bg-gray-300 px-3 py-2 text-sm font-semibold dark:bg-gray-darkest dark:text-white">
          <div>
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
          <div>
            <button
              type="button"
              title={toggleNotificationsLabel}
              onClick={toggleNotifications}
            >
              <ChevronIcon size={20} />
            </button>
          </div>
        </div>
      )}

      {showNotifications &&
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
