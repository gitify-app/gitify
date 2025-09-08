import { type FC, useContext, useMemo } from 'react';

import { AllRead } from '../components/AllRead';
import { Contents } from '../components/layout/Contents';
import { Page } from '../components/layout/Page';
import { AccountNotifications } from '../components/notifications/AccountNotifications';
import { Oops } from '../components/Oops';
import { AppContext } from '../context/App';
import { getAccountUUID } from '../utils/auth/utils';
import { getNotificationCount } from '../utils/notifications/notifications';

export const NotificationsRoute: FC = () => {
  const { notifications, status, globalError, settings } =
    useContext(AppContext);

  const hasMultipleAccounts = useMemo(
    () => notifications.length > 1,
    [notifications],
  );

  const hasNoAccountErrors = useMemo(
    () => notifications.every((account) => account.error === null),
    [notifications],
  );

  const hasNotifications = useMemo(
    () => getNotificationCount(notifications) > 0,
    [notifications],
  );

  if (status === 'error') {
    return <Oops error={globalError} />;
  }

  if (!hasNotifications && hasNoAccountErrors) {
    return <AllRead />;
  }

  return (
    <Page testId="notifications">
      <Contents paddingHorizontal={false}>
        {notifications.map((accountNotifications) => (
          <AccountNotifications
            account={accountNotifications.account}
            error={accountNotifications.error}
            key={getAccountUUID(accountNotifications.account)}
            notifications={accountNotifications.notifications}
            showAccountHeader={
              hasMultipleAccounts || settings.showAccountHeader
            }
          />
        ))}
      </Contents>
    </Page>
  );
};
