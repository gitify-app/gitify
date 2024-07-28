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

  const hasAccountError = useMemo(
    () => notifications.some((account) => account.error !== null),
    [notifications],
  );

  const hasNotifications = useMemo(
    () => getNotificationCount(notifications) > 0,
    [notifications],
  );

  if (status === 'error') {
    return <Oops error={errorDetails ?? Errors.UNKNOWN} />;
  }

  if (!hasNotifications && !hasAccountError) {
    return <AllRead />;
  }

  return (
    <div className="flex flex-col">
      {notifications.map((accountNotifications) => (
        <AccountNotifications
          key={getAccountUUID(accountNotifications.account)}
          account={accountNotifications.account}
          notifications={accountNotifications.notifications}
          error={accountNotifications.error}
          showAccountHostname={
            hasMultipleAccounts || settings.showAccountHostname
          }
        />
      ))}
    </div>
  );
};
