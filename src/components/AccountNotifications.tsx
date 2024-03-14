import React, { useContext, useEffect, useState } from 'react';
import { ChevronDownIcon, ChevronLeftIcon } from '@primer/octicons-react';

import { Notification } from '../typesGithub';
import { RepositoryNotifications } from './Repository';
import { AppContext } from '../context/App';

interface IProps {
  hostname: string;
  notifications: Notification[];
  showAccountHostname: boolean;
}

export const AccountNotifications = (props: IProps) => {
  const { hostname, showAccountHostname, notifications } = props;

  const { groupBy } = useContext(AppContext);

  const sortByDate = (notifications: Notification[][]): Notification[][] => {
    // Create a copy of the notifications array before sorting
    const sortedNotifications = [...notifications];
    return sortedNotifications.sort((a, b) => {
      const dateA = new Date(a[0].updated_at).getTime();
      const dateB = new Date(b[0].updated_at).getTime();
      return dateB - dateA;
    });
  };

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

  const [sortedNotifications, setSortedNotifications] =
    useState<Notification[][]>(groupedNotifications);

  // Function to sort notifications based on the selected grouping type
  const sortNotifications = () => {
    const newSortedNotifications =
      groupBy?.groupType === 'date'
        ? sortByDate(groupedNotifications)
        : groupedNotifications;
    setSortedNotifications(newSortedNotifications);
  };

  useEffect(() => {
    sortNotifications();
  }, [groupBy?.groupType]); // Run the effect when groupBy.groupType changes

  const Chevron = notifications.length > 0 ? ChevronDownIcon : ChevronLeftIcon;

  return (
    <>
      {showAccountHostname && (
        <div className="flex flex-1 items-center justify-between py-2 px-4 bg-gray-300 dark:bg-gray-darkest dark:text-white text-sm">
          {hostname}

          <Chevron size={20} />
        </div>
      )}

      {sortedNotifications.map((repoNotifications) => {
        const repoSlug = repoNotifications[0].repository.full_name;
        return (
          <RepositoryNotifications
            key={repoSlug}
            hostname={hostname}
            repoName={repoSlug}
            repoNotifications={repoNotifications}
          />
        );
      })}
    </>
  );
};
