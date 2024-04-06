import React from 'react';
import TestRenderer from 'react-test-renderer';

import { AppContext } from '../context/App';
import { mockedAccountNotifications } from '../__mocks__/mockedData';
import { NotificationsRoute } from './Notifications';
import { mockSettings } from '../__mocks__/mock-state';

jest.mock('../components/AccountNotifications', () => ({
  AccountNotifications: 'AccountNotifications',
}));

jest.mock('../components/AllRead', () => ({
  AllRead: 'AllRead',
}));

jest.mock('../components/Oops', () => ({
  Oops: 'Oops',
}));

describe('routes/Notifications.tsx', () => {
  it('should render itself & its children (with notifications)', () => {
    const tree = TestRenderer.create(
      <AppContext.Provider
        value={{ notifications: mockedAccountNotifications }}
      >
        <NotificationsRoute />
      </AppContext.Provider>,
    );

    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children (all read notifications)', () => {
    const tree = TestRenderer.create(
      <AppContext.Provider value={{ notifications: [] }}>
        <NotificationsRoute />
      </AppContext.Provider>,
    );
    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children (show account hostname)', () => {
    const tree = TestRenderer.create(
      <AppContext.Provider
        value={{
          notifications: [],
          settings: { ...mockSettings, showAccountHostname: true },
        }}
      >
        <NotificationsRoute />
      </AppContext.Provider>,
    );
    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children (error page - oops)', () => {
    const tree = TestRenderer.create(
      <AppContext.Provider value={{ notifications: [], requestFailed: true }}>
        <NotificationsRoute />
      </AppContext.Provider>,
    );

    expect(tree).toMatchSnapshot();
  });
});
