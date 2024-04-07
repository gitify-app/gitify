import React, { useContext, useMemo } from 'react';

import { AccountNotifications } from '../components/AccountNotifications';
import { AllRead } from '../components/AllRead';
import { AppContext } from '../context/App';
import { Error } from '../components/Error';
import { getNotificationCount } from '../utils/notifications';
import { Errors } from '../utils/constants';

export const NotificationsRoute: React.FC = (props) => {
  const { notifications, requestFailed, errorDetails, settings } =
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
    return <Error error={errorDetails ?? Errors.UNKNOWN} />;
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
