import { type FC, useMemo } from 'react';

import { useAppContext } from '../hooks/useAppContext';
import { useAccountsStore, useSettingsStore } from '../stores';

import { AllRead } from '../components/AllRead';
import { Contents } from '../components/layout/Contents';
import { Page } from '../components/layout/Page';
import { AccountNotifications } from '../components/notifications/AccountNotifications';
import { Oops } from '../components/Oops';

import { getAccountUUID } from '../utils/auth/utils';
import { Errors } from '../utils/errors';

export const NotificationsRoute: FC = () => {
  const { notifications, status, globalError, hasNotifications, isOnline } =
    useAppContext();

  const hasNoAccountErrors = useMemo(
    () => notifications.every((account) => account.error === null),
    [notifications],
  );

  const showAccountHeader = useSettingsStore((s) => s.showAccountHeader);
  const hasMultipleAccounts = useAccountsStore((s) => s.hasMultipleAccounts());

  if (!isOnline) {
    return <Oops error={Errors.OFFLINE} />;
  }

  if (status === 'error') {
    return <Oops error={globalError ?? Errors.UNKNOWN} />;
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
              showAccountHeader={hasMultipleAccounts || showAccountHeader}
            />
          );
        })}
      </Contents>
    </Page>
  );
};
