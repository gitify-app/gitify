import type { ReactElement } from 'react';

import { page } from 'vite-plus/test/browser';

import { renderRoute, type VisualRenderOptions } from '../__helpers__/visual-utils';
import {
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
  mockPersonalAccessTokenAccount,
} from '../__mocks__/account-mocks';
import { mockMultipleAccountNotifications } from '../__mocks__/notifications-mocks';

import { DesignLanguage, Theme } from '../types';

import { AccountsRoute } from './Accounts';
import { AccountScopesRoute } from './AccountScopes';
import { BitbucketLoginWithPersonalAccessTokenRoute } from './bitbucket/LoginWithPersonalAccessToken';
import { FiltersRoute } from './Filters';
import { GiteaLoginWithPersonalAccessTokenRoute } from './gitea/LoginWithPersonalAccessToken';
import { GitHubLoginWithDeviceFlowRoute } from './github/LoginWithDeviceFlow';
import { GitHubLoginWithOAuthAppRoute } from './github/LoginWithOAuthApp';
import { GitHubLoginWithPersonalAccessTokenRoute } from './github/LoginWithPersonalAccessToken';
import { LoginRoute } from './Login';
import { NotificationsRoute } from './Notifications';
import { SettingsRoute } from './Settings';

type RouteState = Omit<VisualRenderOptions, 'theme' | 'designLanguage'>;

interface RouteCase {
  /** Becomes the screenshot filename prefix. */
  name: string;
  element: ReactElement;
  state?: RouteState;
}

const AUTHENTICATED: RouteState = {
  accounts: [mockGitHubCloudAccount, mockGitHubEnterpriseServerAccount],
};

/** Every route reachable from `App.tsx`, in the order they are declared there. */
const ROUTES: RouteCase[] = [
  {
    name: 'notifications',
    element: <NotificationsRoute />,
    state: { ...AUTHENTICATED, notifications: mockMultipleAccountNotifications },
  },
  {
    name: 'filters',
    element: <FiltersRoute />,
    state: { ...AUTHENTICATED, initialEntries: ['/filters'] },
  },
  {
    name: 'settings',
    element: <SettingsRoute />,
    state: { ...AUTHENTICATED, initialEntries: ['/settings'] },
  },
  {
    name: 'accounts',
    element: <AccountsRoute />,
    state: { ...AUTHENTICATED, initialEntries: ['/accounts'] },
  },
  {
    name: 'account-scopes',
    element: <AccountScopesRoute />,
    state: {
      accounts: [mockPersonalAccessTokenAccount],
      // The route reads its account off `location.state`, not the store.
      initialEntries: [
        { pathname: '/account-scopes', state: { account: mockPersonalAccessTokenAccount } },
      ],
    },
  },
  { name: 'login', element: <LoginRoute />, state: { initialEntries: ['/login'] } },
  {
    name: 'login-github-device-flow',
    element: <GitHubLoginWithDeviceFlowRoute />,
    state: { initialEntries: ['/login/github/device-flow'] },
  },
  {
    name: 'login-github-personal-access-token',
    element: <GitHubLoginWithPersonalAccessTokenRoute />,
    state: { initialEntries: ['/login/github/personal-access-token'] },
  },
  {
    name: 'login-github-oauth-app',
    element: <GitHubLoginWithOAuthAppRoute />,
    state: { initialEntries: ['/login/github/oauth-app'] },
  },
  {
    name: 'login-gitea-personal-access-token',
    element: <GiteaLoginWithPersonalAccessTokenRoute />,
    state: { initialEntries: ['/login/gitea/personal-access-token'] },
  },
  {
    name: 'login-bitbucket-personal-access-token',
    element: <BitbucketLoginWithPersonalAccessTokenRoute />,
    state: { initialEntries: ['/login/bitbucket/personal-access-token'] },
  },
];

/**
 * The two densest routes carry the accessibility and Glass variants. Running
 * every theme against every route would multiply the committed baselines
 * without covering token combinations these two do not already exercise.
 */
const DENSE_ROUTES = ROUTES.filter(
  (route) => route.name === 'notifications' || route.name === 'settings',
);

const ACCESSIBILITY_THEMES = [
  Theme.LIGHT_COLORBLIND,
  Theme.LIGHT_TRITANOPIA,
  Theme.DARK_COLORBLIND,
  Theme.DARK_TRITANOPIA,
  Theme.DARK_DIMMED,
];

async function captureRoute(route: RouteCase, theme: Theme, designLanguage: DesignLanguage) {
  await renderRoute(route.element, { ...route.state, theme, designLanguage });

  await expect(page.getByTestId('visual-root')).toMatchScreenshot(
    `${route.name}-${theme.toLowerCase()}-${designLanguage}`,
  );
}

describe('renderer/routes visual regression', () => {
  describe.each([Theme.LIGHT, Theme.DARK])('classic %s', (theme) => {
    it.each(ROUTES)('$name', async (route) => {
      await captureRoute(route, theme, DesignLanguage.CLASSIC);
    });
  });

  describe.each(ACCESSIBILITY_THEMES)('classic %s', (theme) => {
    it.each(DENSE_ROUTES)('$name', async (route) => {
      await captureRoute(route, theme, DesignLanguage.CLASSIC);
    });
  });

  // Captures the Glass content layer only. On macOS the window background is a
  // native vibrancy material that Chromium cannot render, so these baselines
  // exercise the `backdrop-filter` fallback that Linux and Windows receive.
  describe.each([Theme.LIGHT, Theme.DARK])('glass %s', (theme) => {
    it.each(DENSE_ROUTES)('$name', async (route) => {
      await captureRoute(route, theme, DesignLanguage.GLASS);
    });
  });
});
