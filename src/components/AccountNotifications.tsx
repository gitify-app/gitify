import React, { useState } from 'react';
import { ChevronDownIcon, ChevronLeftIcon } from '@primer/octicons-react';

import { Notification } from '../typesGithub';
import { RepositoryNotifications } from './Repository';

interface IProps {
  hostname: string;
  notifications: Notification[];
  showAccountHostname: boolean;
}

export const AccountNotifications = (props: IProps) => {
  const { hostname, showAccountHostname, notifications } = props;

  const [groupType, setGroupType] = useState<'repository' | 'date'>(
    'repository',
  );

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

  const handleGroupTypeChange = (type: 'repository' | 'date') => {
    setGroupType(type);
  };

  return (
    <>
      {showAccountHostname && (
        <div className="flex flex-1 items-center justify-between py-2 px-4 bg-gray-300 dark:bg-gray-darkest dark:text-white text-sm">
          {hostname}

          <Chevron size={20} />
        </div>
      )}

      <label className="flex items-center">
        Group by:
        <select
          value={groupType}
          onChange={(e) =>
            handleGroupTypeChange(e.target.value as 'repository' | 'date')
          }
          className="ml-2 border border-gray-300 rounded p-2"
        >
          <option value="repository">Repository</option>
          <option value="date">Date</option>
        </select>
      </label>

      {Object.values(groupedNotifications).map((repoNotifications) => {
        const repoSlug = repoNotifications[0].repository.full_name;
        return (
          <RepositoryNotifications
            key={repoSlug}
            hostname={hostname}
            repoName={repoSlug}
            repoNotifications={repoNotifications}
            groupType={groupType}
          />
        );
      })}
    </>
  );
};
