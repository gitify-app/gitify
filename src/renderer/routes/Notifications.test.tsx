import { screen } from '@testing-library/react';

import { renderWithProviders } from '../__helpers__/test-utils';
import { mockMultipleAccountNotifications } from '../__mocks__/notifications-mocks';
import { mockSettings } from '../__mocks__/state-mocks';

import { Errors } from '../utils/core/errors';
import {
  clearOrganizationAuthorization,
  reportOrganizationAuthorization,
} from '../utils/notifications/orgAuthorization';
import { NotificationsRoute } from './Notifications';

vi.mock('../components/notifications/NotificationList', () => ({
  NotificationList: () => <p>NotificationList</p>,
}));

vi.mock('../components/AllRead', () => ({
  AllRead: ({ mayBeWithheld }: { mayBeWithheld?: boolean }) => (
    <p>{mayBeWithheld ? 'AllRead withheld' : 'AllRead'}</p>
  ),
}));

vi.mock('../components/Oops', () => ({
  Oops: () => <p>Oops</p>,
}));

describe('renderer/routes/Notifications.tsx', () => {
  beforeEach(() => {
    clearOrganizationAuthorization();
  });
  it('should render itself & its children (with notifications)', () => {
    const tree = renderWithProviders(<NotificationsRoute />, {
      notifications: mockMultipleAccountNotifications,
      hasNotifications: true,
    });

    expect(tree.container).toMatchSnapshot();
  });

  it('should render itself & its children (all read notifications)', () => {
    const tree = renderWithProviders(<NotificationsRoute />);
    expect(tree.container).toMatchSnapshot();
  });

  it('should explain withheld organization access on an empty inbox', () => {
    reportOrganizationAuthorization(mockMultipleAccountNotifications[0].account, {
      kind: 'partial-results',
      organizationIds: ['1'],
    });

    renderWithProviders(<NotificationsRoute />, {
      notifications: mockMultipleAccountNotifications,
    });

    expect(screen.getByText('AllRead withheld')).toBeInTheDocument();
  });

  it('should keep the plain empty state when nothing is withholding access', () => {
    renderWithProviders(<NotificationsRoute />);

    expect(screen.getByText('AllRead')).toBeInTheDocument();
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
