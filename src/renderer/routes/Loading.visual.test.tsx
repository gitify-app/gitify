import { waitFor } from '@testing-library/react';

import { page } from 'vite-plus/test/browser';

import { setNotificationsOverrides } from '../__helpers__/hook-mocks';
import { renderRoute } from '../__helpers__/visual-utils';
import { mockGitHubCloudAccount } from '../__mocks__/account-mocks';

import { DesignLanguage, Theme } from '../types';

import { NotificationsRoute } from './Notifications';

const THEME_VARIANTS = [
  { designLanguage: DesignLanguage.CLASSIC, theme: Theme.LIGHT },
  { designLanguage: DesignLanguage.CLASSIC, theme: Theme.DARK },
  { designLanguage: DesignLanguage.GLASS, theme: Theme.LIGHT },
  { designLanguage: DesignLanguage.GLASS, theme: Theme.DARK },
] as const;

describe('renderer/routes/Loading visual regression', () => {
  describe.each(THEME_VARIANTS)('$theme $designLanguage', ({ designLanguage, theme }) => {
    it('captures the inbox loading state', async () => {
      setNotificationsOverrides({ status: 'loading' });

      renderRoute(<NotificationsRoute />, {
        theme,
        designLanguage,
        accounts: [mockGitHubCloudAccount],
      });

      await waitFor(() => {
        expect(document.body.textContent).toContain('Loading');
      });

      await expect(page.getByTestId('visual-root')).toMatchScreenshot(
        `loading-${theme.toLowerCase()}-${designLanguage}`,
      );
    });
  });
});
