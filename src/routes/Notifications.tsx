import React, { useContext, useMemo } from 'react';

import { AccountNotifications } from '../components/AccountNotifications';
import { AllRead } from '../components/AllRead';
import { AppContext } from '../context/App';
import { Error } from '../components/Error';
import { getNotificationCount } from '../utils/notifications';
import Constants from '../utils/constants';

export const NotificationsRoute: React.FC = (props) => {
  const { notifications, requestFailed, failureType, settings } =
    useContext(AppContext);

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
        return <Error error={Constants.ERRORS.BAD_CREDENTIALS} />;
      case 'MISSING_SCOPES':
        return <Error error={Constants.ERRORS.MISSING_SCOPES} />;
      case 'RATE_LIMITED':
        return <Error error={Constants.ERRORS.RATE_LIMITED} />;
      default:
        return <Error error={Constants.ERRORS.DEFAULT_ERROR} />;
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
          showAccountHostname={
            hasMultipleAccounts || settings.showAccountHostname
          }
        />
      ))}
    </div>
  );
};
