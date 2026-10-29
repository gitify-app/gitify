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
import { useNotificationFocusStore, useSettingsStore } from '../../stores';

import {
  type AccountNotifications,
  DesignLanguage,
  GroupBy,
  type SettingsState,
  Theme,
} from '../../types';

import { getAccountUUID } from '../../utils/auth/utils';

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
  const tree = renderRoute(<NotificationsRoute />, {
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

async function waitForRowBelowHeader(scroller: HTMLElement, excludeId?: string) {
  return waitFor(() => {
    const target = Array.from(
      document.querySelectorAll<HTMLElement>('[data-testid="notification-row"]'),
    )
      .map((row) => row.closest<HTMLElement>('[id]'))
      .find(
        (row): row is HTMLElement =>
          row !== null &&
          row.id !== excludeId &&
          row.getBoundingClientRect().top > scroller.getBoundingClientRect().top + 60,
      );

    expect(target).not.toBeUndefined();

    return target!;
  });
}

function headersPinnedToTop(testId: string) {
  const containerTop = scrollContainer().getBoundingClientRect().top;

  return Array.from(document.querySelectorAll<HTMLElement>(`[data-testid="${testId}"]`)).filter(
    (button) => {
      const header = button.parentElement;
      if (!header) {
        return false;
      }

      return Math.abs(header.getBoundingClientRect().top - containerTop) <= 2;
    },
  );
}

describe('notification list in a browser', () => {
  beforeEach(() => {
    useNotificationFocusStore.getState().reset();
  });

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
    await waitFor(
      async () => {
        await scrollToEnd();
        expect(document.getElementById('notification-299')).not.toBeNull();
      },
      { timeout: 5000 },
    );
    await scrollToStart();

    const repositoryToggle = await waitFor(() => {
      const toggle = document
        .querySelector('img[alt="owner/repo-0"]')
        ?.closest('.group')
        ?.querySelector<HTMLElement>('[data-testid="repository-toggle"]');

      expect(toggle).not.toBeUndefined();

      return toggle!;
    });

    expect(document.getElementById('notification-0')).toBeNull();
    await act(async () => {
      repositoryToggle.click();
    });
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
        expect(document.getElementById('notification-0')?.hasAttribute('data-animating-exit')).toBe(
          true,
        ),
      );
      await scrollToEnd();
      await waitFor(() => expect(document.getElementById('notification-0')).toBeNull());
      await scrollToStart();
      await waitFor(() => expect(document.getElementById('notification-0')).not.toBeNull());
      expect(document.getElementById('notification-0')?.hasAttribute('data-animating-exit')).toBe(
        true,
      );
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
        expect(document.getElementById('notification-0')?.hasAttribute('data-animating-exit')).toBe(
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
    // oxlint-disable-next-line typescript/await-thenable -- Vitest types omit `expect.element`'s poll promise
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
        expect(document.getElementById('notification-0')?.hasAttribute('data-animating-exit')).toBe(
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
      expect(document.getElementById('notification-0')?.hasAttribute('data-animating-exit')).toBe(
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
    expect(document.getElementById('notification-0')?.hasAttribute('data-animating-exit')).toBe(
      true,
    );
    expect(document.getElementById('new-notification')?.hasAttribute('data-animating-exit')).toBe(
      false,
    );
    await act(async () => {
      setNotificationsOverrides({ notifications: [{ ...original[0], notifications: [added] }] });
      tree.rerender(<NotificationsRoute />);
      finish(true);
      await pending;
    });
    // oxlint-disable-next-line typescript/await-thenable -- Vitest types omit `expect.element`'s poll promise
    await expect.element(page.getByTestId('repository-mark-as-read')).toBeVisible();
    expect(scrollContainer()).toBe(scroller);
    expect(document.getElementById('new-notification')?.hasAttribute('data-animating-exit')).toBe(
      false,
    );
  });

  it('keeps the visible row anchored when a notification is prepended', async () => {
    const tree = await renderList(fixture(300));
    const scroller = scrollContainer();

    await act(async () => {
      scroller.scrollTop = 1500;
    });

    const target = await waitForRowBelowHeader(scroller);

    const id = target.id;
    const top = target.getBoundingClientRect().top;
    const original = getMockedNotificationsState().notifications;
    const added = { ...original[0].notifications[0], id: 'new-anchor', order: -1 };

    await act(async () => {
      setNotificationsOverrides({
        notifications: [{ ...original[0], notifications: [added, ...original[0].notifications] }],
      });
      tree.rerender(<NotificationsRoute />);
    });

    await waitFor(() => expect(document.getElementById(id)).not.toBeNull());
    expect(Math.abs(document.getElementById(id)!.getBoundingClientRect().top - top)).toBeLessThan(
      2,
    );
  });

  it('keeps the visible row anchored when a notification above it is removed', async () => {
    const tree = await renderList(fixture(300));
    const scroller = scrollContainer();

    await act(async () => {
      scroller.scrollTop = 1500;
    });

    const target = await waitForRowBelowHeader(scroller, 'notification-0');

    const id = target.id;
    const top = target.getBoundingClientRect().top;
    const original = getMockedNotificationsState().notifications;

    await act(async () => {
      setNotificationsOverrides({
        notifications: original.map((entry) => ({
          ...entry,
          notifications: entry.notifications.filter(
            (notification) => notification.id !== 'notification-0',
          ),
        })),
      });
      tree.rerender(<NotificationsRoute />);
    });

    await waitFor(() => expect(document.getElementById(id)).not.toBeNull());
    expect(Math.abs(document.getElementById(id)!.getBoundingClientRect().top - top)).toBeLessThan(
      2,
    );
  });

  it('resets to the top when the grouping dataset changes', async () => {
    await renderList(fixture(300));

    await act(async () => {
      scrollContainer().scrollTop = 1500;
    });

    await waitFor(() => expect(scrollContainer().scrollTop).toBeGreaterThan(0));

    act(() => useSettingsStore.getState().updateSetting('groupBy', GroupBy.DATE));

    await waitFor(() => expect(scrollContainer().scrollTop).toBe(0));
  });

  it('keeps exactly one repository header pinned while scrolling', async () => {
    await renderList(fixture(300));

    await scrollToEnd();
    await waitFor(() => expect(headersPinnedToTop('open-repository')).toHaveLength(1));

    await scrollToStart();
    await waitFor(() => expect(headersPinnedToTop('open-repository')).toHaveLength(1));
  });

  it('keeps an account header pinned when repository grouping is off', async () => {
    const second = fixture(300).map((notification) => ({
      ...notification,
      id: `second-${notification.id}`,
      account: mockGitHubEnterpriseServerAccount,
    }));

    await renderList([], { groupBy: GroupBy.DATE, showAccountHeader: true }, [
      { account, notifications: fixture(2), error: null },
      { account: mockGitHubEnterpriseServerAccount, notifications: second, error: null },
    ]);

    await scrollToEnd();
    await waitFor(() => expect(headersPinnedToTop('account-profile')).toHaveLength(1));
  });

  it('keeps an error or all-read account header pinned', async () => {
    const accounts = Array.from({ length: 20 }, (_, index) => ({
      ...mockGitHubCloudAccount,
      user: {
        ...mockGitHubCloudAccount.user!,
        id: `${1000 + index}`,
        login: `user-${index}`,
      },
    }));
    const entries: AccountNotifications[] = accounts.map((entry, index) => ({
      account: entry,
      notifications: [],
      error:
        index % 2 === 0
          ? {
              title: `Account failed ${index}`,
              descriptions: ['Try again'],
              emojis: ['🔥'],
            }
          : null,
    }));

    await renderList([], { groupBy: GroupBy.DATE, showAccountHeader: true }, entries);

    await scrollToEnd();
    await waitFor(() => expect(headersPinnedToTop('account-profile')).toHaveLength(1));
  });

  it('focuses a notification below the sticky header', async () => {
    await renderList(fixture(300));

    act(() =>
      useNotificationFocusStore
        .getState()
        .requestFocus(getAccountUUID(account), 'notification-150'),
    );

    await waitFor(() => expect(document.querySelector('[aria-current="true"]')).not.toBeNull());

    const focused = document.querySelector<HTMLElement>('[aria-current="true"]')!;

    await waitFor(
      () => {
        const containerTop = scrollContainer().getBoundingClientRect().top;
        const top = focused.getBoundingClientRect().top;

        expect(top).toBeGreaterThan(containerTop + 30);
        expect(top).toBeLessThan(containerTop + 100);
      },
      { timeout: 5000 },
    );
  });

  it('aligns the start of a focused row taller than the viewport', async () => {
    const tall = fixture(300).map((notification, index) =>
      index === 150
        ? {
            ...notification,
            subject: {
              ...notification.subject,
              title: 'A very long notification title '.repeat(120),
            },
          }
        : notification,
    );

    await renderList(tall, { wrapNotificationTitle: true });

    act(() =>
      useNotificationFocusStore
        .getState()
        .requestFocus(getAccountUUID(account), 'notification-150'),
    );

    await waitFor(() => expect(document.querySelector('[aria-current="true"]')).not.toBeNull());

    const focused = document.querySelector<HTMLElement>('[aria-current="true"]')!;

    await waitFor(
      () => {
        const containerTop = scrollContainer().getBoundingClientRect().top;
        const top = focused.getBoundingClientRect().top;

        expect(top).toBeGreaterThan(containerTop + 30);
        expect(top).toBeLessThan(containerTop + 120);
      },
      { timeout: 5000 },
    );
  });
});
