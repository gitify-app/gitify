import { waitFor } from '@testing-library/react';

import { page } from 'vite-plus/test/browser';

import { renderRoute } from '../../__helpers__/visual-utils';
import { mockGitHubCloudAccount } from '../../__mocks__/account-mocks';
import { mockGitHubCloudGitifyNotifications } from '../../__mocks__/notifications-mocks';

import { NotificationsRoute } from '../../routes/Notifications';
import { getNotificationFailureKey, useNotificationActionFailuresStore } from '../../stores';

import { type AccountNotifications, DesignLanguage, Theme } from '../../types';

import { Errors } from '../../utils/core/errors';

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
    it('reveals the action rail on hover', async () => {
      await renderNotifications(theme, designLanguage);
      const { row } = await hoverFirstRow();

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
          { action: 'markAsRead', error: Errors.ACTION_FORBIDDEN },
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
});
