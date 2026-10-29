import { screen } from '@testing-library/react';

import { renderWithProviders } from '../__helpers__/test-utils';
import { mockMultipleAccountNotifications } from '../__mocks__/notifications-mocks';
import { mockSettings } from '../__mocks__/state-mocks';

import { getErrorDetails } from '../utils/core/errors';
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
  it('renders itself & its children (with notifications)', () => {
    const tree = renderWithProviders(<NotificationsRoute />, {
      notifications: mockMultipleAccountNotifications,
      hasNotifications: true,
    });

    expect(tree.container).toMatchSnapshot();
  });

  it('renders itself & its children (all read notifications)', () => {
    const tree = renderWithProviders(<NotificationsRoute />);
    expect(screen.getByText('AllRead')).toBeInTheDocument();
    expect(screen.queryByText('Loading')).not.toBeInTheDocument();
    expect(tree.container).toMatchSnapshot();
  });

  it('renders loading state instead of all-read while notifications are loading', () => {
    const tree = renderWithProviders(<NotificationsRoute />, {
      status: 'loading',
    });

    expect(screen.getByText('Loading')).toBeInTheDocument();
    expect(screen.queryByText('AllRead')).not.toBeInTheDocument();
    expect(tree.container).toMatchSnapshot();
  });

  it('keeps notifications visible during a background refresh', () => {
    renderWithProviders(<NotificationsRoute />, {
      notifications: mockMultipleAccountNotifications,
      hasNotifications: true,
      isFetching: true,
    });

    expect(screen.getByText('NotificationList')).toBeInTheDocument();
    expect(screen.queryByText('Loading')).not.toBeInTheDocument();
  });

  it('keeps all-read visible during a background refresh with an empty inbox', () => {
    renderWithProviders(<NotificationsRoute />, {
      isFetching: true,
    });

    expect(screen.getByText('AllRead')).toBeInTheDocument();
    expect(screen.queryByText('Loading')).not.toBeInTheDocument();
  });

  it('prefers the offline state over loading', () => {
    renderWithProviders(<NotificationsRoute />, {
      isOnline: false,
      status: 'loading',
    });

    expect(screen.getByText('Oops')).toBeInTheDocument();
    expect(screen.queryByText('Loading')).not.toBeInTheDocument();
  });

  it('prefers the error state over loading', () => {
    renderWithProviders(<NotificationsRoute />, {
      globalError: getErrorDetails('UNKNOWN'),
      status: 'error',
    });

    expect(screen.getByText('Oops')).toBeInTheDocument();
    expect(screen.queryByText('Loading')).not.toBeInTheDocument();
  });

  it('renders itself & its children (show account header)', () => {
    const tree = renderWithProviders(<NotificationsRoute />, {
      notifications: [mockMultipleAccountNotifications[0]],
      hasNotifications: true,
      settings: { ...mockSettings, showAccountHeader: true },
    });
    expect(tree.container).toMatchSnapshot();
  });

  it('renders offline error when not online', () => {
    renderWithProviders(<NotificationsRoute />, {
      isOnline: false,
    });

    expect(screen.getByText('Oops')).toBeInTheDocument();
  });

  describe('error conditions - oops', () => {
    it.each([
      ['bad credentials', 'BAD_CREDENTIALS'],
      ['missing scopes', 'MISSING_SCOPES'],
      ['rate limited', 'RATE_LIMITED'],
      ['unknown error', 'UNKNOWN'],
    ] as const)('%s', (_name, errorType) => {
      const tree = renderWithProviders(<NotificationsRoute />, {
        status: 'error',
        globalError: getErrorDetails(errorType),
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
