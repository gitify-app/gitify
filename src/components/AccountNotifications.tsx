import { ChevronDownIcon, ChevronLeftIcon } from '@primer/octicons-react';
import type { Account } from '../types';
import type { Notification } from '../typesGitHub';
import { openProfile } from '../utils/helpers';
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

  const Chevron = notifications.length > 0 ? ChevronDownIcon : ChevronLeftIcon;

  return (
    <>
      {showAccountHostname && (
        <div className="flex items-center justify-between py-2 px-3 bg-gray-300 dark:bg-gray-darkest dark:text-white text-sm text-semibold">
          <div>
            <PlatformIcon type={account.platform} size={16} />
            <button
              type="button"
              title="Open Profile"
              onClick={() => openProfile(account)}
            >
              @{account.user.login}
            </button>
          </div>
          <div>
            <Chevron size={20} />
          </div>
        </div>
      )}

      {Object.values(groupedNotifications).map((repoNotifications) => {
        const repoSlug = repoNotifications[0].repository.full_name;

        return (
          <RepositoryNotifications
            key={repoSlug}
            hostname={account.hostname}
            repoName={repoSlug}
            repoNotifications={repoNotifications}
          />
        );
      })}
    </>
  );
};
