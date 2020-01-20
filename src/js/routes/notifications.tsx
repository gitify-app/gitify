import * as React from 'react';
import { connect } from 'react-redux';

import { AccountNotifications as Account } from '../components/account-notifications';
import { AllRead } from '../components/all-read';
import { AppState, AccountNotifications } from '../../types/reducers';
import { Oops } from '../components/oops';

interface IProps {
  hasMultipleAccounts: boolean;
  hasNotifications: boolean;
  accountNotifications: AccountNotifications[];
  notificationsCount: number;
  failed: boolean;
}

export const NotificationsRoute = (props: IProps) => {
  const { accountNotifications, hasMultipleAccounts, hasNotifications } = props;

  if (props.failed) {
    return <Oops />;
  }

  if (!hasNotifications) {
    return <AllRead />;
  }

  return (
    <div>
      {accountNotifications.map(account => (
        <Account
          key={account.hostname}
          hostname={account.hostname}
          notifications={account.notifications}
          showAccountHostname={hasMultipleAccounts}
        />
      ))}
    </div>
  );
};

export function mapStateToProps(state: AppState) {
  const notificationsCount = state.notifications.response.reduce(
    (memo, acc) => memo + acc.notifications.length,
    0
  );
  const hasMultipleAccounts = state.notifications.response.length > 1;

  return {
    failed: state.notifications.failed,
    accountNotifications: state.notifications.response,
    notificationsCount,
    hasMultipleAccounts,
    hasNotifications: notificationsCount > 0,
  };
}

export default connect(mapStateToProps, null)(NotificationsRoute);
