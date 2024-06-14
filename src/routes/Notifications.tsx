import { type FC, useContext, useMemo } from 'react';
import { AccountNotifications } from '../components/AccountNotifications';
import { AllRead } from '../components/AllRead';
import { Oops } from '../components/Oops';
import { AppContext } from '../context/App';
import { getAccountUUID } from '../utils/auth/utils';
import { Errors } from '../utils/constants';
import { getNotificationCount } from '../utils/notifications';

export const NotificationsRoute: FC = () => {
  const { notifications, status, errorDetails, settings } =
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

  if (status === 'error') {
    return <Oops error={errorDetails ?? Errors.UNKNOWN} />;
  }

  if (!hasNotifications) {
    return <AllRead />;
  }

  return (
    <div className="flex flex-col bg-white dark:bg-gray-dark">
      {notifications.map((accountNotifications) => (
        <AccountNotifications
          key={getAccountUUID(accountNotifications.account)}
          account={accountNotifications.account}
          notifications={accountNotifications.notifications}
          showAccountHostname={
            hasMultipleAccounts || settings.showAccountHostname
          }
        />
      ))}
    </div>
  );
};
