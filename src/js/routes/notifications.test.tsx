import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { List, Map } from 'immutable';

import { NotificationsRoute, mapStateToProps } from './notifications';
import { mockedNotificationsRecuderData } from '../__mocks__/mockedData';

jest.mock('../components/account-notifications', () => ({
  AccountNotifications: 'AccountNotifications',
}));

jest.mock('../components/all-read', () => ({
  AllRead: 'AllRead',
}));

jest.mock('../components/oops', () => ({
  Oops: 'Oops',
}));

describe('routes/notifications.ts', () => {
  const props = {
    failed: false,
    accountNotifications: mockedNotificationsRecuderData,
    hasNotifications: true,
  };

  it('should test the mapStateToProps method', () => {
    const state = {
      notifications: Map({
        response: mockedNotificationsRecuderData,
        failed: false,
      }),
    };

    const mappedProps = mapStateToProps(state);

    expect(mappedProps.failed).toBeFalsy();
    expect(mappedProps.accountNotifications).toEqual(
      mockedNotificationsRecuderData
    );
    expect(mappedProps.hasNotifications).toBeTruthy();
  });

  it('should render itself & its children (with notifications)', () => {
    const tree = TestRenderer.create(<NotificationsRoute {...props} />);

    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children (all read notifications)', () => {
    const caseProps = {
      ...props,
      hasNotifications: false,
      accountNotifications: List(),
    };

    const tree = TestRenderer.create(<NotificationsRoute {...caseProps} />);

    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children (error page - oops)', () => {
    const caseProps = {
      ...props,
      failed: true,
    };

    const tree = TestRenderer.create(<NotificationsRoute {...caseProps} />);

    expect(tree).toMatchSnapshot();
  });
});
