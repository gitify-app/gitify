import { renderWithAppContext } from '../__helpers__/test-utils';
import { mockMultipleAccountNotifications } from '../__mocks__/notifications-mocks';

import { useSettingsStore } from '../stores';

import { Errors } from '../utils/errors';
import { NotificationsRoute } from './Notifications';

vi.mock('../components/notifications/AccountNotifications', () => ({
  AccountNotifications: () => <p>AccountNotifications</p>,
}));

vi.mock('../components/AllRead', () => ({
  AllRead: () => <p>AllRead</p>,
}));

vi.mock('../components/Oops', () => ({
  Oops: () => <p>Oops</p>,
}));

describe('renderer/routes/Notifications.tsx', () => {
  it('should render itself & its children (with notifications)', () => {
    const tree = renderWithAppContext(<NotificationsRoute />, {
      notifications: mockMultipleAccountNotifications,
    });

    expect(tree.container).toMatchSnapshot();
  });

  it('should render itself & its children (all read notifications)', () => {
    const tree = renderWithAppContext(<NotificationsRoute />);
    expect(tree.container).toMatchSnapshot();
  });

  it('should render itself & its children (show account header)', () => {
    useSettingsStore.setState({ showAccountHeader: true });

    const tree = renderWithAppContext(<NotificationsRoute />, {
      notifications: [mockMultipleAccountNotifications[0]],
    });
    expect(tree.container).toMatchSnapshot();
  });

  it('should render Offline Error when not online', () => {
    const tree = renderWithAppContext(<NotificationsRoute />, {
      notifications: [],
      hasNotifications: false,
      status: 'success',
      globalError: null,
      isOnline: false,
    });

    expect(tree.container).toMatchSnapshot();
  });

  describe('should render itself & its children (error conditions - oops)', () => {
    it('bad credentials', () => {
      const tree = renderWithAppContext(<NotificationsRoute />, {
        status: 'error',
        globalError: Errors.BAD_CREDENTIALS,
      });

      expect(tree.container).toMatchSnapshot();
    });

    it('missing scopes', () => {
      const tree = renderWithAppContext(<NotificationsRoute />, {
        status: 'error',
        globalError: Errors.MISSING_SCOPES,
      });

      expect(tree.container).toMatchSnapshot();
    });

    it('rate limited', () => {
      const tree = renderWithAppContext(<NotificationsRoute />, {
        status: 'error',
        globalError: Errors.RATE_LIMITED,
      });

      expect(tree.container).toMatchSnapshot();
    });

    it('unknown error', () => {
      const tree = renderWithAppContext(<NotificationsRoute />, {
        status: 'error',
        globalError: Errors.UNKNOWN,
      });

      expect(tree.container).toMatchSnapshot();
    });

    it('default error', () => {
      const tree = renderWithAppContext(<NotificationsRoute />, {
        status: 'error',
        globalError: null,
      });

      expect(tree.container).toMatchSnapshot();
    });
  });
});
