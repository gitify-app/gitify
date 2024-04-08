import { type FC, useContext, useMemo } from 'react';

import { AccountNotifications } from '../components/AccountNotifications';
import { AllRead } from '../components/AllRead';
import { Oops } from '../components/Oops';
import { AppContext } from '../context/App';
import { getNotificationCount } from '../utils/notifications';

export const NotificationsRoute: FC = () => {
  const { notifications, requestFailed } = useContext(AppContext);

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
    return <Oops />;
  }

  if (!hasNotifications) {
    return <AllRead />;
  }

  return (
    <div className='flex flex-col flex-1 bg-white dark:bg-gray-dark'>
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
