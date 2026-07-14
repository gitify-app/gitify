import { type FC, useMemo } from 'react';

import { useAppContext } from '../hooks/useAppContext';
import { useAccountsStore, useFiltersStore, useSettingsStore } from '../stores';

import { AllRead } from '../components/AllRead';
import { Contents } from '../components/layout/Contents';
import { Page } from '../components/layout/Page';
import { AccountNotifications } from '../components/notifications/AccountNotifications';
import { Oops } from '../components/Oops';

import { getAccountUUID } from '../utils/auth/utils';
import { Errors } from '../utils/core/errors';

export const NotificationsRoute: FC = () => {
  const { notifications, status, globalError, hasNotifications, isOnline } = useAppContext();

  const filteredAccounts = useFiltersStore((s) => s.accounts);
  const showAccountHeader = useSettingsStore((s) => s.showAccountHeader);
  const hasMultipleAccounts = useAccountsStore((s) => s.hasMultipleAccounts());

  const visibleNotifications = useMemo(
    () =>
      filteredAccounts.length === 0
        ? notifications
        : notifications.filter((n) => filteredAccounts.includes(getAccountUUID(n.account))),
    [notifications, filteredAccounts],
  );

  const hasNoAccountErrors = useMemo(
    () => visibleNotifications.every((account) => account.error === null),
    [visibleNotifications],
  );

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
        {visibleNotifications.map((accountNotification) => {
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
