import { useMemo } from 'react';

import { useNotifications } from '../hooks/useNotifications';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useAccountsStore, useFiltersStore, useSettingsStore } from '../stores';

import { AllRead } from '../components/AllRead';
import { Page } from '../components/layout/Page';
import { Loading } from '../components/Loading';
import { NotificationList } from '../components/notifications/NotificationList';
import { Oops } from '../components/Oops';

import { getAccountUUID } from '../utils/auth/utils';
import { getErrorDetails } from '../utils/core/errors';
import { hasNoAccountErrors } from '../utils/notifications/status';

export function NotificationsRoute() {
  const { notifications, status, globalError, hasNotifications } = useNotifications();
  const isOnline = useOnlineStatus();

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

  const noAccountErrors = useMemo(
    () => hasNoAccountErrors(visibleNotifications),
    [visibleNotifications],
  );

  if (!isOnline) {
    return <Oops error={getErrorDetails('OFFLINE')} />;
  }

  if (status === 'error') {
    return <Oops error={globalError ?? getErrorDetails('UNKNOWN')} />;
  }

  if (status === 'loading') {
    return <Loading />;
  }

  if (!hasNotifications && noAccountErrors) {
    return <AllRead />;
  }

  return (
    <Page testId="notifications">
      <NotificationList
        accountNotifications={visibleNotifications}
        showAccountHeader={hasMultipleAccounts || showAccountHeader}
      />
    </Page>
  );
}
