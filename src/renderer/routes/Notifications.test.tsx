import { renderWithProviders } from '../__helpers__/test-utils';
import { mockMultipleAccountNotifications } from '../__mocks__/notifications-mocks';
import { mockSettings } from '../__mocks__/state-mocks';

import { Errors } from '../utils/core/errors';
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
    const tree = renderWithProviders(<NotificationsRoute />, {
      notifications: mockMultipleAccountNotifications,
    });

    expect(tree.container).toMatchSnapshot();
  });

  it('should render itself & its children (all read notifications)', () => {
    const tree = renderWithProviders(<NotificationsRoute />);
    expect(tree.container).toMatchSnapshot();
  });

  it('should render itself & its children (show account header)', () => {
    const tree = renderWithProviders(<NotificationsRoute />, {
      notifications: [mockMultipleAccountNotifications[0]],
      settings: { ...mockSettings, showAccountHeader: true },
    });
    expect(tree.container).toMatchSnapshot();
  });

  describe('should render itself & its children (error conditions - oops)', () => {
    it('bad credentials', () => {
      const tree = renderWithProviders(<NotificationsRoute />, {
        status: 'error',
        globalError: Errors.BAD_CREDENTIALS,
      });

      expect(tree.container).toMatchSnapshot();
    });

    it('missing scopes', () => {
      const tree = renderWithProviders(<NotificationsRoute />, {
        status: 'error',
        globalError: Errors.MISSING_SCOPES,
      });

      expect(tree.container).toMatchSnapshot();
    });

    it('rate limited', () => {
      const tree = renderWithProviders(<NotificationsRoute />, {
        status: 'error',
        globalError: Errors.RATE_LIMITED,
      });

      expect(tree.container).toMatchSnapshot();
    });

    it('unknown error', () => {
      const tree = renderWithProviders(<NotificationsRoute />, {
        status: 'error',
        globalError: Errors.UNKNOWN,
      });

      expect(tree.container).toMatchSnapshot();
    });

    it('default error', () => {
      const tree = renderWithProviders(<NotificationsRoute />, {
        status: 'error',
        globalError: null,
      });

      expect(tree.container).toMatchSnapshot();
    });
  });
});
