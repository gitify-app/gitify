import { waitFor } from '@testing-library/react';

import { page } from 'vite-plus/test/browser';

import { setIsOnlineOverride, setNotificationsOverrides } from '../__helpers__/hook-mocks';
import { renderRoute } from '../__helpers__/visual-utils';
import { mockGitHubCloudAccount } from '../__mocks__/account-mocks';

import { DesignLanguage, Theme } from '../types';

import { getErrorDetails } from '../utils/core/errors';
import { NotificationsRoute } from './Notifications';

const THEME_VARIANTS = [
  { designLanguage: DesignLanguage.CLASSIC, theme: Theme.LIGHT },
  { designLanguage: DesignLanguage.CLASSIC, theme: Theme.DARK },
  { designLanguage: DesignLanguage.GLASS, theme: Theme.LIGHT },
  { designLanguage: DesignLanguage.GLASS, theme: Theme.DARK },
] as const;

const STATES = [
  {
    name: 'all-read',
    heading: /No new\s+notifications/,
    prepare: () =>
      setNotificationsOverrides({
        globalError: undefined,
        hasNotifications: false,
        notificationCount: 0,
        notifications: [],
        status: 'success',
      }),
  },
  {
    name: 'offline',
    heading: 'Network Offline',
    prepare: () => setIsOnlineOverride(false),
  },
  {
    name: 'error',
    heading: 'Network Error',
    prepare: () =>
      setNotificationsOverrides({ globalError: getErrorDetails('NETWORK'), status: 'error' }),
  },
] as const;

describe('renderer/routes/Notifications states visual regression', () => {
  describe.each(THEME_VARIANTS)('$theme $designLanguage', ({ designLanguage, theme }) => {
    it.each(STATES)('captures $name', async ({ heading, name, prepare }) => {
      prepare();

      renderRoute(<NotificationsRoute />, {
        theme,
        designLanguage,
        accounts: [mockGitHubCloudAccount],
      });

      await waitFor(() => expect(document.body.textContent).toMatch(heading));

      await expect(page.getByTestId('visual-root')).toMatchScreenshot(
        `notifications-${name}-${theme.toLowerCase()}-${designLanguage}`,
      );
    });
  });
});
