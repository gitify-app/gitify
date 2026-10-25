import { waitFor } from '@testing-library/react';

import { page } from 'vite-plus/test/browser';

import { renderRoute } from '../../__helpers__/visual-utils';
import { mockGitHubCloudAccount } from '../../__mocks__/account-mocks';
import { mockGitHubCloudGitifyNotifications } from '../../__mocks__/notifications-mocks';

import { NotificationsRoute } from '../../routes/Notifications';

import { type AccountNotifications, DesignLanguage, Theme } from '../../types';

const notifications: AccountNotifications[] = [
  {
    account: mockGitHubCloudAccount,
    notifications: mockGitHubCloudGitifyNotifications,
    error: null,
  },
];

async function renderNotifications(theme: Theme, designLanguage: DesignLanguage) {
  const tree = renderRoute(<NotificationsRoute />, {
    theme,
    designLanguage,
    accounts: [mockGitHubCloudAccount],
    notifications,
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
  });
});
