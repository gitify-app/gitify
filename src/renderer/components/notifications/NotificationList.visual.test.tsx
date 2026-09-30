import { act, waitFor } from '@testing-library/react';

import { page } from 'vite-plus/test/browser';

import {
  getMockedNotificationsState,
  setNotificationsOverrides,
} from '../../__helpers__/hook-mocks';
import { renderRoute } from '../../__helpers__/visual-utils';
import {
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
} from '../../__mocks__/account-mocks';
import { mockGitifyNotification } from '../../__mocks__/notifications-mocks';

import { NotificationsRoute } from '../../routes/Notifications';

import {
  type AccountNotifications,
  DesignLanguage,
  GroupBy,
  type SettingsState,
  Theme,
} from '../../types';

const account = mockGitHubCloudAccount;
const fixture = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    ...mockGitifyNotification,
    id: `notification-${index}`,
    order: index,
    repository: {
      ...mockGitifyNotification.repository,
      fullName: `owner/repo-${Math.floor(index / 100)}`,
    },
    subject: { ...mockGitifyNotification.subject, title: `Notification ${index}` },
  }));

async function renderList(
  notifications = fixture(2),
  settings: Partial<SettingsState> = {},
  accounts: AccountNotifications[] = [{ account, notifications, error: null }],
) {
  const tree = await renderRoute(<NotificationsRoute />, {
    theme: Theme.LIGHT,
    designLanguage: DesignLanguage.CLASSIC,
    accounts: accounts.map((entry) => entry.account),
    settings: { groupBy: GroupBy.REPOSITORY, ...settings },
    notifications: accounts,
  });
  await waitFor(() =>
    expect(
      document.querySelector(
        '[data-testid="open-repository"], [data-testid="notification-row"], [data-testid="account-profile"]',
      ),
    ).not.toBeNull(),
  );
  return tree;
}

function scrollContainer() {
  const element = document.querySelector<HTMLElement>('.overflow-y-auto');
  if (!element) {
    throw new Error('Notification scroll container is missing');
  }
  return element;
}

async function scrollToEnd() {
  await act(async () => {
    scrollContainer().scrollTop = scrollContainer().scrollHeight;
  });
}

async function scrollToStart() {
  await act(async () => {
    scrollContainer().scrollTop = 0;
  });
}

describe('notification list in a browser', () => {
  it.each([GroupBy.DATE, GroupBy.REPOSITORY])(
    'renders grouping %s and reaches every row in a 2000-notification inbox',
    async (groupBy) => {
      await renderList(fixture(2000), { groupBy });
      expect(document.querySelector('[data-testid="open-repository"]') !== null).toBe(
        groupBy === GroupBy.REPOSITORY,
      );
      await waitFor(() => expect(document.getElementById('notification-0')).not.toBeNull());
      expect(document.querySelectorAll('[data-testid="notification-row"]').length).toBeLessThan(40);
      await scrollToEnd();
      await waitFor(async () => {
        await scrollToEnd();
        expect(document.getElementById('notification-1999')).not.toBeNull();
      });
      expect(document.getElementById('notification-0')).toBeNull();
      expect(document.querySelectorAll('[data-testid="notification-row"]').length).toBeLessThan(40);
      await scrollToStart();
      await waitFor(() => expect(document.getElementById('notification-0')).not.toBeNull());
      expect(document.getElementById('notification-1999')).toBeNull();
    },
  );

  it('keeps repository collapse state when its header unmounts', async () => {
    await renderList(fixture(300));
    await page.getByTestId('repository-toggle').first().click();
    await waitFor(() => expect(document.getElementById('notification-0')).toBeNull());
    await scrollToEnd();
    await waitFor(() => expect(document.getElementById('notification-299')).not.toBeNull());
    await scrollToStart();
    await waitFor(() =>
      expect(document.querySelector('[data-testid="repository-toggle"]')).not.toBeNull(),
    );
    expect(document.getElementById('notification-0')).toBeNull();
    await page.getByTestId('repository-toggle').first().click();
    await waitFor(() => expect(document.getElementById('notification-0')).not.toBeNull());
  });

  it('keeps account collapse state when its header unmounts', async () => {
    const second = fixture(300).map((notification) => ({
      ...notification,
      id: `second-${notification.id}`,
      account: mockGitHubEnterpriseServerAccount,
    }));
    await renderList([], {}, [
      { account, notifications: fixture(2), error: null },
      { account: mockGitHubEnterpriseServerAccount, notifications: second, error: null },
    ]);
    await page.getByTestId('account-toggle').first().click();
    await waitFor(() => expect(document.getElementById('notification-0')).toBeNull());
    await scrollToEnd();
    await waitFor(() => expect(document.getElementById('second-notification-299')).not.toBeNull());
    await scrollToStart();
    await waitFor(() =>
      expect(document.querySelector('[data-testid="account-toggle"]')).not.toBeNull(),
    );
    expect(document.getElementById('notification-0')).toBeNull();
    await page.getByTestId('account-toggle').first().click();
    await waitFor(() => expect(document.getElementById('notification-0')).not.toBeNull());
  });

  it.each([GroupBy.DATE, GroupBy.REPOSITORY])(
    'keeps equal notification IDs from different accounts separate in %s grouping',
    async (groupBy) => {
      const first = {
        ...mockGitifyNotification,
        id: '42',
        subject: {
          ...mockGitifyNotification.subject,
          title: 'A long wrapping notification title '.repeat(8),
        },
      };
      const second = {
        ...mockGitifyNotification,
        id: '42',
        account: mockGitHubEnterpriseServerAccount,
        subject: { ...mockGitifyNotification.subject, title: 'A short title' },
      };
      await renderList([], { groupBy, wrapNotificationTitle: true }, [
        { account, notifications: [first], error: null },
        { account: mockGitHubEnterpriseServerAccount, notifications: [second], error: null },
      ]);
      await waitFor(() => expect(document.querySelectorAll('[id="42"]').length).toBe(2));
      await waitFor(() => {
        const rows = document.querySelectorAll('[id="42"]');
        expect(rows[1].getBoundingClientRect().top).toBeGreaterThanOrEqual(
          rows[0].getBoundingClientRect().bottom,
        );
      });
      await page.getByTestId('account-toggle').first().click();
      await waitFor(() => expect(document.querySelectorAll('[id="42"]').length).toBe(1));
      expect(document.querySelector('[id="42"]')?.textContent).toContain('A short title');
    },
  );

  it.each(['notification', 'repository'])(
    'retains a pending %s action across remounts and restores it on failure',
    async (kind) => {
      let finish: (value: boolean) => void = () => {};
      const pending = new Promise<boolean>((resolve) => {
        finish = resolve;
      });
      const markNotificationsAsRead = vi.fn(() => pending);
      setNotificationsOverrides({ markNotificationsAsRead });
      await renderList(fixture(300), {
        delayNotificationState: false,
        fetchReadNotifications: false,
      });
      await page.getByTestId(`${kind}-mark-as-read`).first().click();
      await waitFor(() =>
        expect(document.getElementById('notification-0')?.classList.contains('opacity-0')).toBe(
          true,
        ),
      );
      await scrollToEnd();
      await waitFor(() => expect(document.getElementById('notification-0')).toBeNull());
      await scrollToStart();
      await waitFor(() => expect(document.getElementById('notification-0')).not.toBeNull());
      expect(document.getElementById('notification-0')?.classList.contains('opacity-0')).toBe(true);
      expect(
        document
          .getElementById('notification-0')
          ?.querySelector('[data-testid="notification-mark-as-read"]'),
      ).toBeNull();
      await act(async () => {
        finish(false);
        await pending;
      });
      await waitFor(() =>
        expect(document.getElementById('notification-0')?.classList.contains('opacity-0')).toBe(
          false,
        ),
      );
      expect(markNotificationsAsRead).toHaveBeenCalledTimes(1);
      await page.getByTestId(`${kind}-mark-as-read`).first().click();
      expect(markNotificationsAsRead).toHaveBeenCalledTimes(2);
    },
  );

  it('renders an account error', async () => {
    await renderList([], { showAccountHeader: true }, [
      {
        account,
        notifications: [],
        error: { title: 'Account failed', descriptions: ['Try again'], emojis: ['🔥'] },
      },
    ]);
    await expect.element(page.getByText('Account failed')).toBeVisible();
  });

  it.each(['notification', 'repository'])(
    'clears a successful %s action before the same rows return',
    async (kind) => {
      let finish: (value: boolean) => void = () => {};
      const pending = new Promise<boolean>((resolve) => {
        finish = resolve;
      });
      setNotificationsOverrides({ markNotificationsAsRead: vi.fn(() => pending) });
      const tree = await renderList(fixture(200), {
        delayNotificationState: false,
        fetchReadNotifications: false,
      });
      const scroller = scrollContainer();
      const original = getMockedNotificationsState().notifications;
      await page.getByTestId(`${kind}-mark-as-read`).first().click();
      await waitFor(() =>
        expect(document.getElementById('notification-0')?.classList.contains('opacity-0')).toBe(
          true,
        ),
      );
      const remaining = original.map((entry) => ({
        ...entry,
        notifications: entry.notifications.filter(
          (notification) => notification.order >= (kind === 'repository' ? 100 : 1),
        ),
      }));
      await act(async () => {
        setNotificationsOverrides({ notifications: remaining });
        tree.rerender(<NotificationsRoute />);
        finish(true);
        await pending;
      });
      await waitFor(() => expect(document.getElementById('notification-0')).toBeNull());
      expect(scrollContainer()).toBe(scroller);
      await act(async () => {
        setNotificationsOverrides({ notifications: original });
        tree.rerender(<NotificationsRoute />);
      });
      await scrollToStart();
      await waitFor(() => expect(document.getElementById('notification-0')).not.toBeNull());
      expect(scrollContainer()).toBe(scroller);
      expect(document.getElementById('notification-0')?.classList.contains('opacity-0')).toBe(
        false,
      );
      expect(
        document
          .getElementById('notification-0')
          ?.querySelector('[data-testid="notification-mark-as-read"]'),
      ).not.toBeNull();
    },
  );

  it('keeps a newly polled notification visible during a repository action', async () => {
    let finish: (value: boolean) => void = () => {};
    const pending = new Promise<boolean>((resolve) => {
      finish = resolve;
    });
    setNotificationsOverrides({ markNotificationsAsRead: vi.fn(() => pending) });
    const tree = await renderList(fixture(2), {
      delayNotificationState: false,
      fetchReadNotifications: false,
    });
    const scroller = scrollContainer();
    const original = getMockedNotificationsState().notifications;
    const added = { ...original[0].notifications[0], id: 'new-notification', order: -1 };
    await page.getByTestId('repository-mark-as-read').first().click();
    await act(async () => {
      setNotificationsOverrides({
        notifications: [{ ...original[0], notifications: [added, ...original[0].notifications] }],
      });
      tree.rerender(<NotificationsRoute />);
    });
    await waitFor(() => expect(document.getElementById('new-notification')).not.toBeNull());
    expect(scrollContainer()).toBe(scroller);
    expect(document.getElementById('notification-0')?.classList.contains('opacity-0')).toBe(true);
    expect(document.getElementById('new-notification')?.classList.contains('opacity-0')).toBe(
      false,
    );
    await act(async () => {
      setNotificationsOverrides({ notifications: [{ ...original[0], notifications: [added] }] });
      tree.rerender(<NotificationsRoute />);
      finish(true);
      await pending;
    });
    await expect.element(page.getByTestId('repository-mark-as-read')).toBeVisible();
    expect(scrollContainer()).toBe(scroller);
    expect(document.getElementById('new-notification')?.classList.contains('opacity-0')).toBe(
      false,
    );
  });
});
