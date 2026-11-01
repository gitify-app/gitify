import { act, waitFor } from '@testing-library/react';

import { cdp, page } from 'vite-plus/test/browser';

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
import { getNotificationFailureKey, useNotificationActionFailuresStore } from '../../stores';

import {
  type AccountNotifications,
  DesignLanguage,
  GroupBy,
  type SettingsState,
  Theme,
} from '../../types';

type CdpSession = {
  send: (method: string, params?: object) => Promise<unknown>;
};

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

/**
 * The visual setup zeroes every transition and delay for screenshot stability.
 * Timing-sensitive exit tests remove that override so the real budget runs.
 */
function enableAnimations() {
  for (const style of document.querySelectorAll('style')) {
    if (style.textContent?.includes('animation-duration: 0s !important')) {
      style.remove();
    }
  }
}

/** The row's parent is the collapsing grid item. */
function rowWrapperHeight(id: string): number {
  return document.getElementById(id)?.parentElement?.getBoundingClientRect().height ?? -1;
}

/** The button's parent is the header root, which sits inside the collapsing grid item. */
function repositoryWrapperHeight(): number {
  return (
    document
      .querySelector('[data-testid="open-repository"]')
      ?.parentElement?.parentElement?.getBoundingClientRect().height ?? -1
  );
}

async function waitForRowCollapsed(id: string) {
  await waitFor(() => expect(rowWrapperHeight(id)).toBeLessThan(2), { timeout: 2000 });
}

describe('notification list in a browser', () => {
  afterEach(() => {
    useNotificationActionFailuresStore.getState().reset();
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

  it('keeps a long unwrapped title and its action rail inside the list', async () => {
    const longTitle = `https://example.com/${'a'.repeat(300)}`;
    await renderList([], { wrapNotificationTitle: false }, [
      {
        account,
        notifications: [
          {
            ...mockGitifyNotification,
            id: 'long-title',
            subject: { ...mockGitifyNotification.subject, title: longTitle },
          },
        ],
        error: null,
      },
    ]);

    const row = document.getElementById('long-title');
    if (!row) {
      throw new Error('Long-title notification row is missing');
    }

    const rowBox = row.getBoundingClientRect();
    expect(rowBox.width).toBeLessThanOrEqual(scrollContainer().getBoundingClientRect().width);

    await page.getByTestId('notification-row').first().hover();
    const rail = row.querySelector<HTMLElement>('.gitify-hover-actions');
    if (!rail) {
      throw new Error('Action rail is missing from the long-title row');
    }
    await waitFor(() => expect(getComputedStyle(rail).opacity).toBe('1'));
    expect(rail.getBoundingClientRect().right).toBeCloseTo(rowBox.right, 0);
  });

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

  it('collapses a pending row within the budget without removing it from the cache', async () => {
    enableAnimations();

    let finish: (value: boolean) => void = () => {};
    const pending = new Promise<boolean>((resolve) => {
      finish = resolve;
    });
    setNotificationsOverrides({ markNotificationsAsRead: vi.fn(() => pending) });
    const tree = await renderList(fixture(2), {
      delayNotificationState: false,
      fetchReadNotifications: false,
    });
    const original = getMockedNotificationsState().notifications;
    const secondTopBefore = document.getElementById('notification-1')!.getBoundingClientRect().top;

    await page.getByTestId('notification-mark-as-read').first().click();
    await waitFor(() =>
      expect(document.getElementById('notification-0')?.hasAttribute('data-animating-exit')).toBe(
        true,
      ),
    );

    const motionLayer = document
      .getElementById('notification-0')
      ?.closest<HTMLElement>('[data-exit-motion]');
    expect(motionLayer).not.toBeNull();
    const motionStyle = getComputedStyle(motionLayer!);
    expect(motionStyle.transitionProperty).toContain('translate');
    expect(motionStyle.transitionProperty).toContain('opacity');
    expect(motionStyle.transitionDuration).not.toBe('0s');

    await waitForRowCollapsed('notification-0');
    expect(document.getElementById('notification-1')!.getBoundingClientRect().top).toBeLessThan(
      secondTopBefore - 20,
    );
    expect(document.querySelector('[data-testid="open-repository"]')?.textContent).toContain('(2)');

    const remaining = original.map((entry) => ({
      ...entry,
      notifications: entry.notifications.filter(
        (notification) => notification.id !== 'notification-0',
      ),
    }));
    await act(async () => {
      setNotificationsOverrides({ notifications: remaining });
      tree.rerender(<NotificationsRoute />);
      finish(true);
      await pending;
    });
    await waitFor(() => expect(document.getElementById('notification-0')).toBeNull());
  });

  it.each(['before', 'after'])(
    'restores a row when a pending action fails %s the collapse budget',
    async (phase) => {
      enableAnimations();

      let finish: (value: boolean) => void = () => {};
      const pending = new Promise<boolean>((resolve) => {
        finish = resolve;
      });
      setNotificationsOverrides({ markNotificationsAsRead: vi.fn(() => pending) });
      await renderList(fixture(2), {
        delayNotificationState: false,
        fetchReadNotifications: false,
      });

      await page.getByTestId('notification-mark-as-read').first().click();
      await waitFor(() =>
        expect(document.getElementById('notification-0')?.hasAttribute('data-animating-exit')).toBe(
          true,
        ),
      );

      if (phase === 'after') {
        await waitForRowCollapsed('notification-0');
      }

      const collapsedBeforeFailure = rowWrapperHeight('notification-0') < 2;
      expect(collapsedBeforeFailure).toBe(phase === 'after');

      await act(async () => {
        finish(false);
        await pending;
      });

      await waitFor(() => {
        expect(rowWrapperHeight('notification-0')).toBeGreaterThan(20);
        expect(document.getElementById('notification-0')?.hasAttribute('data-animating-exit')).toBe(
          false,
        );
      });
      expect(
        document
          .getElementById('notification-0')
          ?.querySelector('[data-testid="notification-mark-as-read"]'),
      ).not.toBeNull();

      useNotificationActionFailuresStore
        .getState()
        .setFailure(getNotificationFailureKey(account, 'notification-0'), {
          action: 'markAsRead',
          error: { title: 'Action Forbidden', descriptions: [], emojis: [] },
        });
      await waitFor(() => {
        expect(
          document
            .getElementById('notification-0')
            ?.querySelector<HTMLElement>('[data-testid="notification-mark-as-read"]')
            ?.getAttribute('title'),
        ).toContain('Action Forbidden');
      });
    },
  );

  it('collapses a repository group as one unit and restores a partial failure', async () => {
    enableAnimations();

    let finish: (value: boolean) => void = () => {};
    const pending = new Promise<boolean>((resolve) => {
      finish = resolve;
    });
    setNotificationsOverrides({ markNotificationsAsRead: vi.fn(() => pending) });
    const tree = await renderList(fixture(2), {
      delayNotificationState: false,
      fetchReadNotifications: false,
    });
    const original = getMockedNotificationsState().notifications;

    await page.getByTestId('repository-mark-as-read').first().click();
    await waitFor(() =>
      expect(document.getElementById('notification-0')?.hasAttribute('data-animating-exit')).toBe(
        true,
      ),
    );

    await waitFor(
      () => {
        expect(repositoryWrapperHeight()).toBeLessThan(2);
        expect(rowWrapperHeight('notification-0')).toBeLessThan(2);
        expect(rowWrapperHeight('notification-1')).toBeLessThan(2);
      },
      { timeout: 2000 },
    );

    const remaining = original.map((entry) => ({
      ...entry,
      notifications: entry.notifications.filter(
        (notification) => notification.id !== 'notification-0',
      ),
    }));
    await act(async () => {
      setNotificationsOverrides({ notifications: remaining });
      tree.rerender(<NotificationsRoute />);
      finish(false);
      await pending;
    });

    await waitFor(() => {
      expect(document.getElementById('notification-0')).toBeNull();
      expect(repositoryWrapperHeight()).toBeGreaterThan(20);
      expect(rowWrapperHeight('notification-1')).toBeGreaterThan(20);
    });
    expect(document.getElementById('notification-1')?.hasAttribute('data-animating-exit')).toBe(
      false,
    );
    expect(document.querySelector('[data-testid="open-repository"]')?.textContent).toContain('(1)');
  });

  it('mounts a pending exiting row already collapsed after a remount', async () => {
    enableAnimations();

    let finish: (value: boolean) => void = () => {};
    const pending = new Promise<boolean>((resolve) => {
      finish = resolve;
    });
    setNotificationsOverrides({ markNotificationsAsRead: vi.fn(() => pending) });
    await renderList(fixture(300), {
      delayNotificationState: false,
      fetchReadNotifications: false,
    });

    await page.getByTestId('notification-mark-as-read').first().click();
    await waitFor(() =>
      expect(document.getElementById('notification-0')?.hasAttribute('data-animating-exit')).toBe(
        true,
      ),
    );
    await waitForRowCollapsed('notification-0');

    await scrollToEnd();
    await waitFor(() => expect(document.getElementById('notification-0')).toBeNull());
    await scrollToStart();
    await waitFor(() => expect(document.getElementById('notification-0')).not.toBeNull());

    expect(document.getElementById('notification-0')?.hasAttribute('data-animating-exit')).toBe(
      true,
    );
    expect(rowWrapperHeight('notification-0')).toBeLessThan(2);

    await act(async () => {
      finish(false);
      await pending;
    });
  });

  it('collapses without the slide when reduced motion is preferred', async () => {
    enableAnimations();
    const session = cdp() as unknown as CdpSession;

    let finish: (value: boolean) => void = () => {};
    const pending = new Promise<boolean>((resolve) => {
      finish = resolve;
    });

    try {
      await session.send('Emulation.setEmulatedMedia', {
        features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
      });

      setNotificationsOverrides({ markNotificationsAsRead: vi.fn(() => pending) });
      await renderList(fixture(2), {
        delayNotificationState: false,
        fetchReadNotifications: false,
      });

      await page.getByTestId('notification-mark-as-read').first().click();
      await waitFor(() =>
        expect(document.getElementById('notification-0')?.hasAttribute('data-animating-exit')).toBe(
          true,
        ),
      );

      await waitFor(() => expect(rowWrapperHeight('notification-0')).toBeLessThan(2), {
        timeout: 300,
      });

      const motionLayer = document
        .getElementById('notification-0')
        ?.closest<HTMLElement>('[data-exit-motion]');
      expect(motionLayer).not.toBeNull();
      expect(getComputedStyle(motionLayer!).transitionProperty).toBe('none');

      await act(async () => {
        finish(false);
        await pending;
      });
    } finally {
      await session.send('Emulation.setEmulatedMedia', {
        features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }],
      });
    }
  });

  it('keeps the visible anchor when an exiting row above the viewport collapses', async () => {
    enableAnimations();

    // Give the test time to scroll and capture the anchor before the collapse.
    const delayStyle = document.createElement('style');
    delayStyle.textContent = '.delay-350 { transition-delay: 1000ms !important; }';
    document.head.appendChild(delayStyle);

    let finish: (value: boolean) => void = () => {};
    const pending = new Promise<boolean>((resolve) => {
      finish = resolve;
    });

    try {
      setNotificationsOverrides({ markNotificationsAsRead: vi.fn(() => pending) });
      await renderList(fixture(20), {
        delayNotificationState: false,
        fetchReadNotifications: false,
      });

      await act(async () => {
        scrollContainer().scrollTop = 5 * 58;
      });
      await waitFor(() => expect(document.getElementById('notification-5')).not.toBeNull());

      const action = document
        .getElementById('notification-5')
        ?.querySelector<HTMLElement>('[data-testid="notification-mark-as-read"]');
      if (!action) {
        throw new Error('Notification action is missing');
      }
      await page.elementLocator(action).click();
      await waitFor(() =>
        expect(document.getElementById('notification-5')?.hasAttribute('data-animating-exit')).toBe(
          true,
        ),
      );

      await act(async () => {
        scrollContainer().scrollTop += 80;
      });
      await waitFor(() => expect(document.getElementById('notification-8')).not.toBeNull());
      const anchorTopBefore = document
        .getElementById('notification-8')!
        .getBoundingClientRect().top;
      expect(rowWrapperHeight('notification-5')).toBeGreaterThan(20);

      await waitForRowCollapsed('notification-5');
      const anchorTopAfter = document.getElementById('notification-8')!.getBoundingClientRect().top;
      expect(Math.abs(anchorTopAfter - anchorTopBefore)).toBeLessThan(4);
    } finally {
      delayStyle.remove();
      await act(async () => {
        finish(false);
        await pending;
      });
    }
  });
});
