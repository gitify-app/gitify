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

jest.mock('../components/Error', () => ({
  Error: 'Error',
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
          notifications: [mockedAccountNotifications[0]],
          settings: { ...mockSettings, showAccountHostname: true },
        }}
      >
        <NotificationsRoute />
      </AppContext.Provider>,
    );
    expect(tree).toMatchSnapshot();
  });

  describe('should render itself & its children (error conditions - oops)', () => {
    it('bad credentials', () => {
      const tree = TestRenderer.create(
        <AppContext.Provider
          value={{
            notifications: [],
            requestFailed: true,
            failureType: 'BAD_CREDENTIALS',
          }}
        >
          <NotificationsRoute />
        </AppContext.Provider>,
      );

      expect(tree).toMatchSnapshot();
    });

    it('missing scopes', () => {
      const tree = TestRenderer.create(
        <AppContext.Provider
          value={{
            notifications: [],
            requestFailed: true,
            failureType: 'MISSING_SCOPES',
          }}
        >
          <NotificationsRoute />
        </AppContext.Provider>,
      );

      expect(tree).toMatchSnapshot();
    });

    it('rate limited', () => {
      const tree = TestRenderer.create(
        <AppContext.Provider
          value={{
            notifications: [],
            requestFailed: true,
            failureType: 'RATE_LIMITED',
          }}
        >
          <NotificationsRoute />
        </AppContext.Provider>,
      );

      expect(tree).toMatchSnapshot();
    });

    it('default error', () => {
      const tree = TestRenderer.create(
        <AppContext.Provider
          value={{
            notifications: [],
            requestFailed: true,
            failureType: 'UNKNOWN',
          }}
        >
          <NotificationsRoute />
        </AppContext.Provider>,
      );

      expect(tree).toMatchSnapshot();
    });
  });
});
