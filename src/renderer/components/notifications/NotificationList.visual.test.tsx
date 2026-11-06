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
  IconColor,
  type Link,
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

  it('keeps the metric catch-all adjacent to the full-height action rail', async () => {
    const notification = {
      ...mockGitifyNotification,
      id: 'pill-heavy',
      subject: {
        ...mockGitifyNotification.subject,
        issueType: { name: 'Bug', color: IconColor.RED },
        parentIssue: {
          number: 456,
          title: 'Parent Epic',
          url: 'https://github.com/gitify-app/gitify/issues/456' as Link,
        },
        subIssueProgress: { total: 5, completed: 2, percentCompleted: 40 },
        labels: [
          { name: 'needs-investigation', color: 'ff0000' },
          { name: 'good first issue', color: '00ff00' },
          { name: 'area/notifications', color: '0000ff' },
          { name: 'a really long label name here', color: 'ffff00' },
        ],
        checks: { state: 'FAILURE' as const, passed: 9, failed: 1, pending: 0, total: 10 },
        commentCount: 3,
        reactionsCount: 12,
      },
    };

    await renderList([], { showPills: true }, [
      { account, notifications: [notification], error: null },
    ]);

    const row = document.getElementById('pill-heavy');
    if (!row) {
      throw new Error('Pill-heavy notification row is missing');
    }

    await page.getByTestId('notification-row').first().hover();
    const rail = row.querySelector<HTMLElement>('.gitify-hover-actions');
    if (!rail) {
      throw new Error('Action rail is missing from the pill-heavy row');
    }
    await waitFor(() => expect(getComputedStyle(rail).opacity).toBe('1'));

    const rowBox = row.getBoundingClientRect();
    const railBox = rail.getBoundingClientRect();
    const titleRow = row.querySelector<HTMLElement>('[data-testid="notification-row"]');
    const footer = titleRow?.parentElement?.lastElementChild;
    if (!footer) {
      throw new Error('Notification footer is missing');
    }

    // The rail spans the row, giving a large hit zone and a pill-free lane down
    // the right edge for rapid row actions.
    expect(railBox.top).toBeLessThanOrEqual(rowBox.top + 1);
    expect(railBox.bottom).toBeGreaterThanOrEqual(rowBox.bottom - 1);

    const overflow = await waitFor(() => {
      const element = row.querySelector<HTMLElement>('[data-testid="metric-overflow"]');
      expect(element).not.toBeNull();
      return element!;
    });
    const overflowBox = overflow.getBoundingClientRect();
    expect(overflow.querySelector('svg')).not.toBeNull();
    expect(footer.getBoundingClientRect().height).toBeLessThanOrEqual(21);

    const inlinePills = Array.from(
      row.querySelectorAll<HTMLElement>(
        '[data-testid="metric-pills"] > div:not([aria-hidden]) button[aria-describedby]',
      ),
    );
    expect(inlinePills.length).toBeGreaterThan(0);
    const inlineBoxes = inlinePills.map((pill) => pill.getBoundingClientRect());
    expect(new Set(inlineBoxes.map((box) => Math.round(box.top))).size).toBe(1);
    for (const box of inlineBoxes) {
      expect(box.right).toBeLessThanOrEqual(overflowBox.left);
    }

    // The catch-all follows the last visible pill directly, so the visible pills
    // stay left-aligned with the rest of the footer text.
    const lastPillRight = Math.max(...inlineBoxes.map((box) => box.right));
    expect(overflowBox.left - lastPillRight).toBeGreaterThanOrEqual(0);
    expect(overflowBox.left - lastPillRight).toBeLessThanOrEqual(5);

    // Inline pills keep their tooltip (with the deliberate long delay).
    const firstPill = inlinePills[0];
    const tooltipId = firstPill.getAttribute('aria-describedby');
    const label = firstPill.getAttribute('aria-label');
    if (!tooltipId || !label) {
      throw new Error('Pill is missing its tooltip wiring');
    }
    await page.getByRole('button', { name: label }).first().hover();
    await waitFor(
      () => {
        expect(document.getElementById(tooltipId)?.matches(':popover-open')).toBe(true);
      },
      { timeout: 3000 },
    );

    const overflowCount = Number(overflow.textContent?.replace('+', ''));
    expect(overflowCount).toBeGreaterThan(0);

    // Hovering the catch-all reveals the collapsed metrics; no click required.
    await page.getByTestId('metric-overflow').hover();
    const popover = await waitFor(() => {
      const element = document.querySelector<HTMLElement>(
        '[data-testid="metric-overflow-popover"]',
      );
      expect(element).not.toBeNull();
      return element!;
    });
    expect(popover.querySelector('[data-testid="metric-overflow-caret"]')).not.toBeNull();

    // Every collapsed pill remains available (with its tooltip/action) in the
    // portaled popover, outside the row's `contain: paint` clipping.
    expect(row.contains(popover)).toBe(false);
    const collapsedPills = popover.querySelectorAll('button');
    expect(collapsedPills).toHaveLength(overflowCount);
    for (const pill of collapsedPills) {
      expect(pill).toHaveAttribute('aria-describedby');
    }

    // The collapsed pills are packed to the popover's right edge, nearest the
    // pointer, rather than left-aligned across the overlay.
    const popoverBox = popover.getBoundingClientRect();
    const collapsedBoxes = Array.from(collapsedPills).map((pill) => pill.getBoundingClientRect());
    expect(Math.abs(popoverBox.right - overflowBox.right)).toBeLessThanOrEqual(1);
    const firstRowTop = Math.min(...collapsedBoxes.map((box) => Math.round(box.top)));
    const rightmostOnFirstRow = Math.max(
      ...collapsedBoxes
        .filter((box) => Math.round(box.top) === firstRowTop)
        .map((box) => box.right),
    );
    expect(popoverBox.right - rightmostOnFirstRow).toBeLessThanOrEqual(5);

    // Hovering must not move focus into the popover or back onto the chip.
    expect(document.activeElement).not.toBe(overflow);
    expect(popover.contains(document.activeElement)).toBe(false);

    // Re-entering the row must not produce a focus ring on the chip or the
    // first collapsed pill.
    await page.getByTestId('visual-root').hover({ position: { x: 480, y: 380 } });
    await waitFor(() =>
      expect(document.querySelector('[data-testid="metric-overflow-popover"]')).toBeNull(),
    );
    await page.getByTestId('metric-overflow').hover();
    await waitFor(() =>
      expect(document.querySelector('[data-testid="metric-overflow-popover"]')).not.toBeNull(),
    );
    expect(document.activeElement).not.toBe(overflow);
    expect(
      document
        .querySelector('[data-testid="metric-overflow-popover"]')
        ?.contains(document.activeElement),
    ).toBe(false);
  });

  it('sizes the catch-all popover to the collapsed pills', async () => {
    const notification = {
      ...mockGitifyNotification,
      id: 'light-pills',
      subject: {
        ...mockGitifyNotification.subject,
        reviewers: undefined,
        issueType: { name: 'Bug', color: IconColor.RED },
        parentIssue: {
          number: 456,
          title: 'Parent Epic',
          url: 'https://github.com/gitify-app/gitify/issues/456' as Link,
        },
        subIssueProgress: { total: 5, completed: 2, percentCompleted: 40 },
        commentCount: 3,
      },
    };

    await renderList([], { showPills: true }, [
      { account, notifications: [notification], error: null },
    ]);

    const row = document.getElementById('light-pills');
    if (!row) {
      throw new Error('Light pill notification row is missing');
    }

    await page.getByTestId('notification-row').first().hover();
    await waitFor(() =>
      expect(document.querySelector('[data-testid="metric-overflow"]')).not.toBeNull(),
    );
    await page.getByTestId('metric-overflow').hover();
    const popover = await waitFor(() => {
      const element = document.querySelector<HTMLElement>(
        '[data-testid="metric-overflow-popover"]',
      );
      expect(element).not.toBeNull();
      return element!;
    });

    // The collapsed pills determine the width, with equal horizontal padding
    // matching the pill gap and compact vertical padding like the row lines.
    const popoverBox = popover.getBoundingClientRect();
    const popoverStyle = getComputedStyle(popover);
    expect(popoverBox.width).toBeGreaterThan(0);
    expect(popoverBox.width).toBeLessThan(256);
    expect(popoverBox.height).toBeLessThanOrEqual(30);
    expect(popoverStyle.paddingLeft).toBe('4px');
    expect(popoverStyle.paddingRight).toBe(popoverStyle.paddingLeft);
    expect(popoverStyle.paddingTop).toBe(popoverStyle.paddingBottom);
    expect(popover.scrollWidth).toBe(popover.clientWidth);
    expect(popover.querySelector('[data-testid="metric-overflow-caret"]')).not.toBeNull();
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
