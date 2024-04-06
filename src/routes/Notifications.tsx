import React, { useContext, useMemo } from 'react';

import { AccountNotifications } from '../components/AccountNotifications';
import { AllRead } from '../components/AllRead';
import { AppContext } from '../context/App';
import { Oops } from '../components/error/Oops';
import { getNotificationCount } from '../utils/notifications';
import { RateLimited } from '../components/error/RateLimited';
import { MissingScopes } from '../components/error/MissingScopes';
import { BadCredentials } from '../components/error/BadCredentials';

export const NotificationsRoute: React.FC = (props) => {
  const { notifications, requestFailed, failureType } = useContext(AppContext);

  const hasMultipleAccounts = useMemo(
    () => notifications.length > 1,
    [notifications],
  );
  const notificationsCount = useMemo(() => {
    return getNotificationCount(notifications);
  }, [notifications]);

  const hasNotifications = useMemo(
    () => notificationsCount > 0,
    [notificationsCount],
  );

  if (requestFailed) {
    switch (failureType) {
      case 'BAD_CREDENTIALS':
        return <BadCredentials />;
      case 'MISSING_SCOPES':
        return <MissingScopes />;
      case 'RATE_LIMITED':
        return <RateLimited />;
      default:
        return <Oops />;
    }
  }

  if (!hasNotifications) {
    return <AllRead />;
  }

  return (
    <div className="flex flex-col flex-1 bg-white dark:bg-gray-dark">
      {notifications.map((account) => (
        <AccountNotifications
          key={account.hostname}
          hostname={account.hostname}
          notifications={account.notifications}
          showAccountHostname={hasMultipleAccounts}
        />
      ))}
    </div>
  );
};
