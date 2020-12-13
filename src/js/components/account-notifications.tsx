import * as React from 'react';
import * as _ from 'lodash';
import { ChevronDownIcon, ChevronLeftIcon } from '@primer/octicons-react';

import { Notification } from '../../types/github';
import RepositoryNotifications from './repository';

interface IProps {
  hostname: string;
  notifications: Notification[];
  showAccountHostname: boolean;
}

export const AccountNotifications = (props: IProps) => {
  const { hostname, showAccountHostname, notifications } = props;

  const groupedNotifications = _(notifications)
    .groupBy((obj) => obj.repository.full_name)
    .sortBy((_, key) => key)
    .value();

  const Chevron = notifications.length > 0 ? ChevronDownIcon : ChevronLeftIcon;

  return (
    <>
      {showAccountHostname && (
        <div className="flex flex-1 items-center justify-between py-2 px-4 bg-gray-300 dark:bg-gray-darkest dark:text-white text-sm">
          {hostname}

          <Chevron size={20} />
        </div>
      )}

      {Object.values(groupedNotifications).map((repoNotifications) => {
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
