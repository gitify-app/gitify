import TestRenderer from 'react-test-renderer';

import { mockSettings } from '../__mocks__/mock-state';
import { mockedAccountNotifications } from '../__mocks__/mockedData';
import { AppContext } from '../context/App';
import { Errors } from '../utils/constants';
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
            status: 'error',
            errorDetails: Errors.BAD_CREDENTIALS,
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
            status: 'error',
            errorDetails: Errors.MISSING_SCOPES,
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
            status: 'error',
            errorDetails: Errors.RATE_LIMITED,
          }}
        >
          <NotificationsRoute />
        </AppContext.Provider>,
      );

      expect(tree).toMatchSnapshot();
    });

    it('unknown error', () => {
      const tree = TestRenderer.create(
        <AppContext.Provider
          value={{
            notifications: [],
            status: 'error',
            errorDetails: Errors.UNKNOWN,
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
            status: 'error',
            errorDetails: null,
          }}
        >
          <NotificationsRoute />
        </AppContext.Provider>,
      );

      expect(tree).toMatchSnapshot();
    });
  });
});
