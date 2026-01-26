import { type FC, useMemo, useRef } from 'react';

import { useAppContext } from '../hooks/useAppContext';

import { AllRead } from '../components/AllRead';
import { Contents } from '../components/layout/Contents';
import { Page } from '../components/layout/Page';
import { AccountNotifications } from '../components/notifications/AccountNotifications';
import { Oops } from '../components/Oops';

import { getAccountUUID } from '../utils/auth/utils';

export const NotificationsRoute: FC = () => {
  const { notifications, status, globalError, settings, hasNotifications } =
    useAppContext();

  // Store previous successful state
  const prevStateRef = useRef({
    notifications,
    status,
    globalError,
    hasNotifications,
  });

  // Update ref only if not loading
  if (status !== 'loading') {
    prevStateRef.current = {
      notifications,
      status,
      globalError,
      hasNotifications,
    };
  }

  // Use previous state if loading
  const displayState =
    status === 'loading'
      ? prevStateRef.current
      : {
          notifications,
          status,
          globalError,
          hasNotifications,
        };

  const hasMultipleAccounts = useMemo(
    () => displayState.notifications.length > 1,
    [displayState.notifications],
  );

  const hasNoAccountErrors = useMemo(
    () => displayState.notifications.every((account) => account.error === null),
    [displayState.notifications],
  );

  if (displayState.status === 'error') {
    return <Oops error={displayState.globalError} />;
  }

  if (!displayState.hasNotifications && hasNoAccountErrors) {
    return <AllRead />;
  }

  return (
    <Page testId="notifications">
      <Contents paddingHorizontal={false}>
        {displayState.notifications.map((accountNotification) => {
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
