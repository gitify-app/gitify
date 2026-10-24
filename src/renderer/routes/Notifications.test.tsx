import { screen } from '@testing-library/react';

import { renderWithProviders } from '../__helpers__/test-utils';
import { mockMultipleAccountNotifications } from '../__mocks__/notifications-mocks';
import { mockSettings } from '../__mocks__/state-mocks';

import { Errors } from '../utils/core/errors';
import { NotificationsRoute } from './Notifications';

vi.mock('../components/notifications/NotificationList', () => ({
  NotificationList: () => <p>NotificationList</p>,
}));

vi.mock('../components/AllRead', () => ({
  AllRead: () => <p>AllRead</p>,
}));

vi.mock('../components/Loading', () => ({
  Loading: () => <p>Loading</p>,
}));

vi.mock('../components/Oops', () => ({
  Oops: () => <p>Oops</p>,
}));

describe('renderer/routes/Notifications.tsx', () => {
  it('should render itself & its children (with notifications)', () => {
    const tree = renderWithProviders(<NotificationsRoute />, {
      notifications: mockMultipleAccountNotifications,
      hasNotifications: true,
    });

    expect(tree.container).toMatchSnapshot();
  });

  it('should render itself & its children (all read notifications)', () => {
    const tree = renderWithProviders(<NotificationsRoute />);
    expect(screen.getByText('AllRead')).toBeInTheDocument();
    expect(screen.queryByText('Loading')).not.toBeInTheDocument();
    expect(tree.container).toMatchSnapshot();
  });

  it('should render loading state instead of all-read while notifications are loading', () => {
    const tree = renderWithProviders(<NotificationsRoute />, {
      status: 'loading',
    });

    expect(screen.getByText('Loading')).toBeInTheDocument();
    expect(screen.queryByText('AllRead')).not.toBeInTheDocument();
    expect(tree.container).toMatchSnapshot();
  });

  it('should keep notifications visible during a background refresh', () => {
    renderWithProviders(<NotificationsRoute />, {
      notifications: mockMultipleAccountNotifications,
      hasNotifications: true,
      isFetching: true,
    });

    expect(screen.getByText('NotificationList')).toBeInTheDocument();
    expect(screen.queryByText('Loading')).not.toBeInTheDocument();
  });

  it('should keep all-read visible during a background refresh with an empty inbox', () => {
    renderWithProviders(<NotificationsRoute />, {
      isFetching: true,
    });

    expect(screen.getByText('AllRead')).toBeInTheDocument();
    expect(screen.queryByText('Loading')).not.toBeInTheDocument();
  });

  it('should prefer the offline state over loading', () => {
    renderWithProviders(<NotificationsRoute />, {
      isOnline: false,
      status: 'loading',
    });

    expect(screen.getByText('Oops')).toBeInTheDocument();
    expect(screen.queryByText('Loading')).not.toBeInTheDocument();
  });

  it('should prefer the error state over loading', () => {
    renderWithProviders(<NotificationsRoute />, {
      globalError: Errors.UNKNOWN,
      status: 'error',
    });

    expect(screen.getByText('Oops')).toBeInTheDocument();
    expect(screen.queryByText('Loading')).not.toBeInTheDocument();
  });

  it('should render itself & its children (show account header)', () => {
    const tree = renderWithProviders(<NotificationsRoute />, {
      notifications: [mockMultipleAccountNotifications[0]],
      hasNotifications: true,
      settings: { ...mockSettings, showAccountHeader: true },
    });
    expect(tree.container).toMatchSnapshot();
  });

  it('should render offline error when not online', () => {
    renderWithProviders(<NotificationsRoute />, {
      isOnline: false,
    });

    expect(screen.getByText('Oops')).toBeInTheDocument();
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
        globalError: undefined,
      });

      expect(tree.container).toMatchSnapshot();
    });
  });
});
