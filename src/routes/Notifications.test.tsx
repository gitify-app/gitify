// @ts-nocheck
import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';

import { AppState, NotificationsState } from '../../types/reducers';
import { mockedNotificationsReducerData } from '../js/__mocks__/mockedData';
import { NotificationsRoute, mapStateToProps } from './Notifications';

jest.mock('../../components/AccountNotifications', () => ({
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
    accountNotifications: mockedNotificationsReducerData,
    notificationsCount: 4,
    hasMultipleAccounts: true,
    hasNotifications: true,
  };

  it('should test the mapStateToProps method', () => {
    const state = {
      notifications: {
        response: mockedNotificationsReducerData,
        failed: false,
      } as NotificationsState,
    } as AppState;

    const mappedProps = mapStateToProps(state);

    expect(mappedProps.failed).toBeFalsy();
    expect(mappedProps.accountNotifications).toEqual(
      mockedNotificationsReducerData
    );
    expect(mappedProps.hasNotifications).toBeTruthy();
    expect(mappedProps.notificationsCount).toBe(4);
  });

  it('should render itself & its children (with notifications)', () => {
    const tree = TestRenderer.create(<NotificationsRoute {...props} />);

    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children (all read notifications)', () => {
    const caseProps = {
      ...props,
      hasNotifications: false,
      accountNotifications: [],
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
