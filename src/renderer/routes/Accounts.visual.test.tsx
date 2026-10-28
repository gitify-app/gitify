import { waitFor } from '@testing-library/react';

import { page } from 'vite-plus/test/browser';

import { renderRoute } from '../__helpers__/visual-utils';
import {
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
} from '../__mocks__/account-mocks';

import { DesignLanguage, Theme } from '../types';

import { AccountsRoute } from './Accounts';

const accounts = [mockGitHubCloudAccount, mockGitHubEnterpriseServerAccount];

const THEME_VARIANTS = [
  { designLanguage: DesignLanguage.CLASSIC, theme: Theme.LIGHT },
  { designLanguage: DesignLanguage.CLASSIC, theme: Theme.DARK },
  { designLanguage: DesignLanguage.GLASS, theme: Theme.LIGHT },
  { designLanguage: DesignLanguage.GLASS, theme: Theme.DARK },
] as const;

describe('renderer/routes/Accounts visual regression', () => {
  describe.each(THEME_VARIANTS)('$theme $designLanguage', ({ designLanguage, theme }) => {
    it('captures the add-account menu open', async () => {
      renderRoute(<AccountsRoute />, {
        theme,
        designLanguage,
        accounts,
        initialEntries: ['/accounts'],
      });

      await waitFor(() =>
        expect(document.querySelector('[data-testid="account-add-new"]')).not.toBeNull(),
      );
      await page.getByTestId('account-add-new').click();

      await waitFor(() =>
        expect(document.querySelector('[data-testid="account-add-forge-github"]')).not.toBeNull(),
      );

      await expect(page.getByTestId('visual-root')).toMatchScreenshot(
        `accounts-add-menu-${theme.toLowerCase()}-${designLanguage}`,
      );
    });
  });
});
