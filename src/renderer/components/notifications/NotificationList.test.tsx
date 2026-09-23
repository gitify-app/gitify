import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../__helpers__/test-utils';
import {
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
} from '../../__mocks__/account-mocks';
import {
  mockGitHubCloudGitifyNotifications,
  mockGitifyNotification,
} from '../../__mocks__/notifications-mocks';
import { mockSettings } from '../../__mocks__/state-mocks';

import { type AccountNotifications, GroupBy } from '../../types';

import { NotificationList } from './NotificationList';

const VIEWPORT_HEIGHT = 300;
const ITEM_HEIGHT = 50;

// happy-dom reports `offsetHeight` as 0, leaving the virtualizer a 0-height
// viewport that renders nothing.
beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    get(this: HTMLElement) {
      return this.dataset.index === undefined ? VIEWPORT_HEIGHT : ITEM_HEIGHT;
    },
  });
});

afterAll(() => {
  Reflect.deleteProperty(HTMLElement.prototype, 'offsetHeight');
});

const singleAccount: AccountNotifications[] = [
  {
    account: mockGitHubCloudAccount,
    notifications: mockGitHubCloudGitifyNotifications,
    error: null,
  },
];

const mountedRows = (container: HTMLElement) => container.querySelectorAll('[data-index]').length;

const hasRow = (container: HTMLElement, notificationId: string) =>
  container.querySelector(`[id="${notificationId}"]`) !== null;

describe('renderer/components/notifications/NotificationList.tsx', () => {
  it('renders a repository header and its notifications when grouping by repository', () => {
    const tree = renderWithProviders(
      <NotificationList accountNotifications={singleAccount} showAccountHeader={false} />,
      { settings: { ...mockSettings, groupBy: GroupBy.REPOSITORY } },
    );

    expect(screen.getByTestId('open-repository')).toBeInTheDocument();
    expect(hasRow(tree.container, mockGitifyNotification.id)).toBe(true);
  });

  it('renders notifications without repository headers when grouping by date', () => {
    const tree = renderWithProviders(
      <NotificationList accountNotifications={singleAccount} showAccountHeader={false} />,
      { settings: { ...mockSettings, groupBy: GroupBy.DATE } },
    );

    expect(screen.queryByTestId('open-repository')).not.toBeInTheDocument();
    expect(hasRow(tree.container, mockGitifyNotification.id)).toBe(true);
  });

  it('renders the account header only when asked to', () => {
    const { unmount } = renderWithProviders(
      <NotificationList accountNotifications={singleAccount} showAccountHeader={false} />,
    );

    expect(screen.queryByTestId('account-profile')).not.toBeInTheDocument();

    unmount();
    renderWithProviders(
      <NotificationList accountNotifications={singleAccount} showAccountHeader />,
    );

    expect(screen.getByTestId('account-profile')).toBeInTheDocument();
  });

  it('hides an account\u2019s notifications when its header is collapsed', async () => {
    const tree = renderWithProviders(
      <NotificationList accountNotifications={singleAccount} showAccountHeader />,
      { settings: { ...mockSettings, groupBy: GroupBy.DATE } },
    );

    await userEvent.click(screen.getByTestId('account-toggle'));

    expect(hasRow(tree.container, mockGitifyNotification.id)).toBe(false);
    expect(screen.getByTestId('account-profile')).toBeInTheDocument();
  });

  it('hides a repository\u2019s notifications when its header is collapsed', async () => {
    const tree = renderWithProviders(
      <NotificationList accountNotifications={singleAccount} showAccountHeader={false} />,
      { settings: { ...mockSettings, groupBy: GroupBy.REPOSITORY } },
    );

    await userEvent.click(screen.getByTestId('repository-toggle'));

    expect(hasRow(tree.container, mockGitifyNotification.id)).toBe(false);
    expect(screen.getByTestId('open-repository')).toBeInTheDocument();
  });

  it('shows a repository again after its notifications are reloaded', async () => {
    const markNotificationsAsRead = vi.fn();
    const tree = renderWithProviders(
      <NotificationList accountNotifications={singleAccount} showAccountHeader={false} />,
      {
        settings: { ...mockSettings, groupBy: GroupBy.REPOSITORY },
        markNotificationsAsRead,
      },
    );

    await userEvent.click(screen.getByTestId('repository-mark-as-read'));

    tree.rerender(
      <NotificationList
        accountNotifications={[{ account: mockGitHubCloudAccount, notifications: [], error: null }]}
        showAccountHeader={false}
      />,
    );
    tree.rerender(
      <NotificationList accountNotifications={singleAccount} showAccountHeader={false} />,
    );

    expect(tree.container.querySelector(`[id="${mockGitifyNotification.id}"]`)).not.toHaveClass(
      'opacity-0',
    );
  });

  it('shows a new notification when repository remains after group action', async () => {
    const newNotification = { ...mockGitifyNotification, id: 'new-notification' };
    const tree = renderWithProviders(
      <NotificationList accountNotifications={singleAccount} showAccountHeader={false} />,
      {
        settings: { ...mockSettings, groupBy: GroupBy.REPOSITORY },
        markNotificationsAsRead: vi.fn(),
      },
    );

    await userEvent.click(screen.getByTestId('repository-mark-as-read'));

    tree.rerender(
      <NotificationList
        accountNotifications={[
          {
            account: mockGitHubCloudAccount,
            notifications: [newNotification],
            error: null,
          },
        ]}
        showAccountHeader={false}
      />,
    );

    expect(tree.container.querySelector('[id="new-notification"]')).not.toHaveClass('opacity-0');
  });

  it('renders an account error instead of its notifications', () => {
    renderWithProviders(
      <NotificationList
        accountNotifications={[
          {
            account: mockGitHubCloudAccount,
            notifications: [],
            error: { title: 'Error title', descriptions: ['Error description'], emojis: ['🔥'] },
          },
        ]}
        showAccountHeader
      />,
    );

    expect(screen.getByText('Error title')).toBeInTheDocument();
  });

  it('renders every account in turn', () => {
    renderWithProviders(
      <NotificationList
        accountNotifications={[
          { account: mockGitHubCloudAccount, notifications: [mockGitifyNotification], error: null },
          {
            account: mockGitHubEnterpriseServerAccount,
            notifications: [],
            error: null,
          },
        ]}
        showAccountHeader
      />,
    );

    expect(screen.getAllByTestId('account-profile')).toHaveLength(2);
  });

  it('mounts only the notifications within the scroll window', () => {
    const notifications = Array.from({ length: 500 }, (_, index) => ({
      ...mockGitifyNotification,
      id: `notification-${index}`,
      order: index,
    }));

    const tree = renderWithProviders(
      <NotificationList
        accountNotifications={[{ account: mockGitHubCloudAccount, notifications, error: null }]}
        showAccountHeader={false}
      />,
      { settings: { ...mockSettings, groupBy: GroupBy.DATE } },
    );

    // A 300px window over 50px rows, plus overscan either side - not 500 rows.
    expect(mountedRows(tree.container)).toBeLessThan(30);
    expect(mountedRows(tree.container)).toBeGreaterThan(0);
  });
});
