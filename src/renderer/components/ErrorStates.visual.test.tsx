import { page } from 'vite-plus/test/browser';

import { renderRoute } from '../__helpers__/visual-utils';
import { mockGitHubCloudAccount } from '../__mocks__/account-mocks';

import { DesignLanguage, Theme } from '../types';

import { AppErrorFallback } from './AppErrorBoundary';
import { RouteError } from './RouteError';

const ERROR_STATES = [
  { element: <RouteError />, name: 'route-error', withChrome: true },
  { element: <AppErrorFallback />, name: 'app-error', withChrome: false },
];

const THEME_VARIANTS = [
  { designLanguage: DesignLanguage.CLASSIC, label: 'classic light', theme: Theme.LIGHT },
  { designLanguage: DesignLanguage.CLASSIC, label: 'classic dark', theme: Theme.DARK },
  { designLanguage: DesignLanguage.GLASS, label: 'glass light', theme: Theme.LIGHT },
  { designLanguage: DesignLanguage.GLASS, label: 'glass dark', theme: Theme.DARK },
] as const;

describe('renderer/components error states visual regression', () => {
  describe.each(THEME_VARIANTS)('$label', ({ designLanguage, theme }) => {
    it.each(ERROR_STATES)('$name', async ({ element, name, withChrome }) => {
      renderRoute(element, {
        accounts: [mockGitHubCloudAccount],
        designLanguage,
        theme,
        withChrome,
      });

      await expect(page.getByTestId('visual-root')).toMatchScreenshot(
        `${name}-${theme.toLowerCase()}-${designLanguage}`,
      );
    });
  });
});
