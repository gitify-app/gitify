import { type FC, useMemo } from 'react';

import { AllRead } from '../components/AllRead';
import { Contents } from '../components/layout/Contents';
import { Page } from '../components/layout/Page';
import { AccountNotifications } from '../components/notifications/AccountNotifications';
import { Oops } from '../components/Oops';
import { useAppContext } from '../hooks/useAppContext';
import { getAccountUUID } from '../utils/auth/utils';

export const NotificationsRoute: FC = () => {
  const { notifications, status, globalError, settings, hasNotifications } =
    useAppContext();

  const hasMultipleAccounts = useMemo(
    () => notifications.length > 1,
    [notifications],
  );

  const hasNoAccountErrors = useMemo(
    () => notifications.every((account) => account.error === null),
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
        {notifications.map((accountNotification) => {
          return (
            <AccountNotifications
              account={accountNotification.account}
              error={accountNotification.error}
              key={getAccountUUID(accountNotification.account)}
              notifications={accountNotification.notifications}
              showAccountHeader={
                hasMultipleAccounts || settings.showAccountHeader
              }
            />
          );
        })}
      </Contents>
    </Page>
  );
};
