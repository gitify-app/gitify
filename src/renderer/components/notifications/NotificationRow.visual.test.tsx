import { waitFor } from '@testing-library/react';

import { page } from 'vite-plus/test/browser';

import { renderRoute } from '../../__helpers__/visual-utils';
import { mockGitHubCloudAccount, mockGiteaAccount } from '../../__mocks__/account-mocks';
import { mockGitHubCloudGitifyNotifications } from '../../__mocks__/notifications-mocks';

import { NotificationsRoute } from '../../routes/Notifications';
import { getNotificationFailureKey, useNotificationActionFailuresStore } from '../../stores';

import { type AccountNotifications, DesignLanguage, Theme } from '../../types';

import { getErrorDetails } from '../../utils/core/errors';

const notifications: AccountNotifications[] = [
  {
    account: mockGitHubCloudAccount,
    notifications: mockGitHubCloudGitifyNotifications,
    error: null,
  },
];

const readNotifications: AccountNotifications[] = [
  {
    account: mockGitHubCloudAccount,
    notifications: [
      { ...mockGitHubCloudGitifyNotifications[0], unread: false },
      mockGitHubCloudGitifyNotifications[1],
    ],
    error: null,
  },
];

// Gitea supports neither mark as done nor unsubscribe, so a read row has no actions.
const readGiteaNotifications: AccountNotifications[] = [
  {
    account: mockGiteaAccount,
    notifications: mockGitHubCloudGitifyNotifications.map((notification) => ({
      ...notification,
      account: mockGiteaAccount,
      unread: false,
    })),
    error: null,
  },
];

async function renderNotifications(
  theme: Theme,
  designLanguage: DesignLanguage,
  accountNotifications = notifications,
) {
  const tree = renderRoute(<NotificationsRoute />, {
    theme,
    designLanguage,
    accounts: [mockGitHubCloudAccount],
    notifications: accountNotifications,
  });

  await waitFor(() => {
    expect(document.querySelector('[data-testid="notification-row"]')).not.toBeNull();
  });

  return tree;
}

async function hoverFirstRow() {
  await page.getByTestId('notification-row').first().hover();

  const row = document.getElementById(mockGitHubCloudGitifyNotifications[0].id);
  if (!row) {
    throw new Error('First notification row is missing');
  }

  const rail = row.querySelector<HTMLElement>('.gitify-hover-actions');
  if (!rail) {
    throw new Error('Action rail is missing from the first notification row');
  }

  await waitFor(() => expect(getComputedStyle(rail).opacity).toBe('1'));

  return { rail, row };
}

/**
 * Returns the row content hit-tested at `x`, level with the rail's middle.
 * Hit testing follows `clip-path`, so content found inside the rail is content
 * that would show through the buttons.
 */
function rowContentAt(rail: HTMLElement, x: number) {
  const content = [...(rail.parentElement?.children ?? [])].filter((child) => child !== rail);
  const { top, bottom } = rail.getBoundingClientRect();
  return document
    .elementsFromPoint(x, (top + bottom) / 2)
    .filter((element) => content.some((child) => child.contains(element)));
}

/**
 * Classic paints the rail with the row's hover fill. Glass leaves it clear so
 * it blends into the row on every platform (no fill can match the macOS
 * vibrancy material), and clips the row content at the rail's leading edge.
 */
function expectRailHidesRowContent(rail: HTMLElement, designLanguage: DesignLanguage) {
  const { backgroundColor, backgroundImage } = getComputedStyle(rail);
  const hasFill = backgroundColor !== 'rgba(0, 0, 0, 0)' || backgroundImage !== 'none';
  const clipsContent = rowContentAt(rail, rail.getBoundingClientRect().left + 1).length === 0;

  expect(hasFill).toBe(designLanguage === DesignLanguage.CLASSIC);
  // Without a fill, nothing but the clip keeps the content out of the rail.
  expect(hasFill || clipsContent).toBe(true);
}

const THEME_VARIANTS = [
  { designLanguage: DesignLanguage.CLASSIC, theme: Theme.LIGHT },
  { designLanguage: DesignLanguage.CLASSIC, theme: Theme.DARK },
  { designLanguage: DesignLanguage.GLASS, theme: Theme.LIGHT },
  { designLanguage: DesignLanguage.GLASS, theme: Theme.DARK },
] as const;

describe('renderer/components/notifications/NotificationRow visual regression', () => {
  beforeEach(() => {
    useNotificationActionFailuresStore.getState().reset();
  });

  describe.each(THEME_VARIANTS)('$theme $designLanguage', ({ designLanguage, theme }) => {
    it('reveals row and header actions on focus over the row content, then hides them on blur', async () => {
      renderRoute(<NotificationsRoute />, {
        theme,
        designLanguage,
        accounts: [mockGitHubCloudAccount],
        settings: { showAccountHeader: true },
        notifications,
      });
      await page.getByTestId('visual-root').hover({ position: { x: 480, y: 380 } });

      for (const testId of [
        'account-toggle',
        'repository-mark-as-read',
        'notification-mark-as-read',
      ]) {
        const button = document.querySelector<HTMLButtonElement>(`[data-testid="${testId}"]`);
        const rail = button?.closest<HTMLElement>('.gitify-hover-actions');
        if (!button || !rail) {
          throw new Error(`Missing action rail for ${testId}`);
        }

        await waitFor(() => expect(getComputedStyle(rail).opacity).toBe('0'));
        button.focus();
        expect(button).toHaveFocus();
        await waitFor(() => expect(getComputedStyle(rail).opacity).toBe('1'));

        expectRailHidesRowContent(rail, designLanguage);

        button.blur();
        await waitFor(() => expect(getComputedStyle(rail).opacity).toBe('0'));
      }
    });

    it('hides the notification number while its actions have focus', async () => {
      await renderNotifications(theme, designLanguage);
      await page.getByTestId('visual-root').hover({ position: { x: 480, y: 380 } });

      const button = document.querySelector<HTMLButtonElement>(
        '[data-testid="notification-mark-as-read"]',
      );
      const reference = document.querySelector<HTMLElement>(
        '[data-testid="notification-reference"]',
      );
      if (!button || !reference) {
        throw new Error('First notification action or reference is missing');
      }

      expect(getComputedStyle(reference).visibility).toBe('visible');
      button.focus();
      expect(getComputedStyle(reference).visibility).toBe('hidden');
      button.blur();
      expect(getComputedStyle(reference).visibility).toBe('visible');
    });

    it('reveals the action rail on hover', async () => {
      await renderNotifications(theme, designLanguage);
      const { rail, row } = await hoverFirstRow();
      expectRailHidesRowContent(rail, designLanguage);

      const reference = row.querySelector<HTMLElement>('[data-testid="notification-reference"]');
      if (!reference) {
        throw new Error('Issue number is missing from the first notification row');
      }
      expect(getComputedStyle(reference).visibility).toBe('hidden');

      await expect(page.getByTestId('visual-root')).toMatchScreenshot(
        `notifications-action-rail-${theme.toLowerCase()}-${designLanguage}`,
      );
    });

    it('captures a read notification row', async () => {
      await renderNotifications(theme, designLanguage, readNotifications);

      const readRow = document.getElementById(mockGitHubCloudGitifyNotifications[0].id);
      if (!readRow) {
        throw new Error('Read notification row is missing');
      }
      expect(readRow.className).toContain('opacity-50');

      // Move the pointer off the row so the capture shows the read styling
      // rather than an action rail left over from the previous test.
      await page.getByTestId('visual-root').hover({ position: { x: 480, y: 380 } });
      const rail = readRow.querySelector<HTMLElement>('.gitify-hover-actions');
      if (!rail) {
        throw new Error('Read row action rail is missing');
      }
      await waitFor(() => expect(getComputedStyle(rail).opacity).toBe('0'));

      await expect(page.getByTestId('visual-root')).toMatchScreenshot(
        `notifications-read-row-${theme.toLowerCase()}-${designLanguage}`,
      );
    });

    it('captures a failed action on the action rail', async () => {
      useNotificationActionFailuresStore
        .getState()
        .setFailure(
          getNotificationFailureKey(
            mockGitHubCloudAccount,
            mockGitHubCloudGitifyNotifications[0].id,
          ),
          { action: 'markAsRead', error: getErrorDetails('ACTION_FORBIDDEN') },
        );

      await renderNotifications(theme, designLanguage);
      await hoverFirstRow();

      const failedAction = document.querySelector<HTMLElement>(
        '[data-testid="notification-mark-as-read"]',
      );
      if (!failedAction) {
        throw new Error('Failed mark-as-read action is missing');
      }
      expect(failedAction.dataset.variant).toBe('danger');
      expect(failedAction.getAttribute('aria-label')).toContain('Action Forbidden');

      await expect(page.getByTestId('visual-root')).toMatchScreenshot(
        `notifications-action-failure-${theme.toLowerCase()}-${designLanguage}`,
      );
    });
  });

  describe.each([Theme.LIGHT, Theme.DARK])('%s glass action rail', (theme) => {
    // The clip is sized from the rendered button count, so cover a full rail,
    // the single-button rail of a read row (mark as read and mark as done are
    // hidden) and an empty rail. The row content spans the row, so it must
    // stay visible right up to the rail's leading edge.
    it.each([
      { buttons: 3, accountNotifications: notifications },
      { buttons: 1, accountNotifications: readNotifications },
      { buttons: 0, accountNotifications: readGiteaNotifications },
    ])(
      'clips the row content at a $buttons-button rail',
      async ({ buttons, accountNotifications }) => {
        await renderNotifications(theme, DesignLanguage.GLASS, accountNotifications);
        const { rail } = await hoverFirstRow();
        const { left } = rail.getBoundingClientRect();

        expect(rail.children).toHaveLength(buttons);
        expect(rowContentAt(rail, left - 1)).not.toEqual([]);
        expect(rowContentAt(rail, left + 1)).toEqual([]);
      },
    );
  });
});
