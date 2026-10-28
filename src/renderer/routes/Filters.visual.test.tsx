import { waitFor } from '@testing-library/react';

import { page } from 'vite-plus/test/browser';

import { renderRoute, scrollToTestId } from '../__helpers__/visual-utils';
import {
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
} from '../__mocks__/account-mocks';
import { mockMultipleAccountNotifications } from '../__mocks__/notifications-mocks';

import type { FiltersStore } from '../stores';

import { DesignLanguage, Theme } from '../types';

import { FiltersRoute } from './Filters';

const accounts = [mockGitHubCloudAccount, mockGitHubEnterpriseServerAccount];

const THEME_VARIANTS = [
  { designLanguage: DesignLanguage.CLASSIC, theme: Theme.LIGHT },
  { designLanguage: DesignLanguage.CLASSIC, theme: Theme.DARK },
  { designLanguage: DesignLanguage.GLASS, theme: Theme.LIGHT },
  { designLanguage: DesignLanguage.GLASS, theme: Theme.DARK },
] as const;

const ACTIVE_FILTERS: Partial<FiltersStore> = {
  reasons: ['subscribed'],
  states: ['open'],
  subjectTypes: ['Issue'],
  userTypes: ['User'],
};

function renderFilters(
  theme: Theme,
  designLanguage: DesignLanguage,
  filters?: Partial<FiltersStore>,
) {
  return renderRoute(<FiltersRoute />, {
    theme,
    designLanguage,
    accounts,
    filters,
    initialEntries: ['/filters'],
    notifications: mockMultipleAccountNotifications,
  });
}

async function openSearchHelp(theme: Theme, designLanguage: DesignLanguage) {
  renderFilters(theme, designLanguage);

  const trigger = page.getByTestId('tooltip-icon-tooltip-search');
  await waitFor(() =>
    expect(document.querySelector('[data-testid="tooltip-icon-tooltip-search"]')).not.toBeNull(),
  );
  await trigger.click();

  const content = page.getByTestId('tooltip-content-tooltip-search');
  // oxlint-disable-next-line typescript/await-thenable -- Vitest types omit `expect.element`'s poll promise
  await expect.element(content).toBeVisible();

  const root = document.querySelector('[data-testid="visual-root"]');
  const popover = document.querySelector('[data-testid="tooltip-content-tooltip-search"]');
  if (!root || !popover) {
    throw new Error('Help popover is missing');
  }

  expect(root.contains(popover)).toBe(true);
}

describe('renderer/routes/Filters visual regression', () => {
  describe.each(THEME_VARIANTS)('$theme $designLanguage', ({ designLanguage, theme }) => {
    it('captures an open help popover', async () => {
      await openSearchHelp(theme, designLanguage);

      await expect(page.getByTestId('visual-root')).toMatchScreenshot(
        `filters-help-popover-${theme.toLowerCase()}-${designLanguage}`,
      );
    });

    it('captures active filter selections', async () => {
      renderFilters(theme, designLanguage, ACTIVE_FILTERS);

      await waitFor(() =>
        expect(document.querySelector('[data-testid="checkbox-userTypes-User"]')).not.toBeNull(),
      );

      expect(
        (document.querySelector('[data-testid="checkbox-userTypes-User"]') as HTMLInputElement)
          .checked,
      ).toBe(true);

      await scrollToTestId('checkbox-userTypes-User');

      await expect(page.getByTestId('visual-root')).toMatchScreenshot(
        `filters-active-selections-${theme.toLowerCase()}-${designLanguage}`,
      );
    });
  });
});
