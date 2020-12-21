import React from 'react';
import TestRenderer from 'react-test-renderer';

import { NotificationsContext } from '../context/Notifications';
import { mockedAccountNotifications } from '../__mocks__/mockedData';
import { NotificationsRoute } from './Notifications';

jest.mock('../components/AccountNotifications', () => ({
  AccountNotifications: 'AccountNotifications',
}));

jest.mock('../components/AllRead', () => ({
  AllRead: 'AllRead',
}));

jest.mock('../components/Oops', () => ({
  Oops: 'Oops',
}));

describe('routes/Notifications.ts', () => {
  it('should render itself & its children (with notifications)', () => {
    const tree = TestRenderer.create(
      <NotificationsContext.Provider
        value={{ notifications: mockedAccountNotifications }}
      >
        <NotificationsRoute />
      </NotificationsContext.Provider>
    );

    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children (all read notifications)', () => {
    const tree = TestRenderer.create(
      <NotificationsContext.Provider value={{ notifications: [] }}>
        <NotificationsRoute />
      </NotificationsContext.Provider>
    );
    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children (error page - oops)', () => {
    const tree = TestRenderer.create(
      <NotificationsContext.Provider
        value={{ notifications: [], requestFailed: true }}
      >
        <NotificationsRoute />
      </NotificationsContext.Provider>
    );

    expect(tree).toMatchSnapshot();
  });
});
