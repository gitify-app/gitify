import type { ReactElement } from 'react';

import { page } from 'vite-plus/test/browser';

import { renderRoute, type VisualRenderOptions } from '../__helpers__/visual-utils';
import {
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
  mockPersonalAccessTokenAccount,
} from '../__mocks__/account-mocks';
import { mockMultipleAccountNotifications } from '../__mocks__/notifications-mocks';

import { DesignLanguage, type SettingsState, Theme } from '../types';

import { AccountsRoute } from './Accounts';
import { AccountScopesRoute } from './AccountScopes';
import { BitbucketLoginWithPersonalAccessTokenRoute } from './bitbucket/LoginWithPersonalAccessToken';
import { FiltersRoute } from './Filters';
import { GiteaLoginWithPersonalAccessTokenRoute } from './gitea/LoginWithPersonalAccessToken';
import { GitHubLoginWithCustomOAuthAppRoute } from './github/LoginWithCustomOAuthApp';
import { GitHubLoginWithDeviceFlowRoute } from './github/LoginWithDeviceFlow';
import { GitHubLoginWithCLIRoute } from './github/LoginWithGitHubCLI';
import { GitHubLoginWithPersonalAccessTokenRoute } from './github/LoginWithPersonalAccessToken';
import { GitLabLoginWithPersonalAccessTokenRoute } from './gitlab/LoginWithPersonalAccessToken';
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
    name: 'login-github-cli',
    element: <GitHubLoginWithCLIRoute />,
    state: { initialEntries: ['/login/github/cli'] },
  },
  {
    name: 'login-github-personal-access-token',
    element: <GitHubLoginWithPersonalAccessTokenRoute />,
    state: { initialEntries: ['/login/github/personal-access-token'] },
  },
  {
    name: 'login-github-custom-oauth-app',
    element: <GitHubLoginWithCustomOAuthAppRoute />,
    state: { initialEntries: ['/login/github/custom-oauth-app'] },
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
  {
    name: 'login-gitlab-personal-access-token',
    element: <GitLabLoginWithPersonalAccessTokenRoute />,
    state: { initialEntries: ['/login/gitlab/personal-access-token'] },
  },
];

/**
 * The densest routes additionally carry the accessibility and high-contrast
 * variants. Every route still runs through the four base theme combinations.
 */
const DENSE_ROUTES = ROUTES.filter(
  (route) => route.name === 'notifications' || route.name === 'settings',
);

const THEME_VARIANTS = [
  { designLanguage: DesignLanguage.CLASSIC, label: 'classic light', theme: Theme.LIGHT },
  { designLanguage: DesignLanguage.CLASSIC, label: 'classic dark', theme: Theme.DARK },
  { designLanguage: DesignLanguage.GLASS, label: 'glass light', theme: Theme.LIGHT },
  { designLanguage: DesignLanguage.GLASS, label: 'glass dark', theme: Theme.DARK },
] as const;

const ACCESSIBILITY_THEMES = [
  Theme.LIGHT_COLORBLIND,
  Theme.LIGHT_TRITANOPIA,
  Theme.DARK_COLORBLIND,
  Theme.DARK_TRITANOPIA,
  Theme.DARK_DIMMED,
];

const HIGH_CONTRAST_THEMES = [Theme.LIGHT, Theme.DARK];

interface CaptureOptions {
  /** Overrides the screenshot filename prefix. */
  name?: string;
  /** Merged over the route's own settings. */
  settings?: Partial<SettingsState>;
}

async function captureRoute(
  route: RouteCase,
  theme: Theme,
  designLanguage: DesignLanguage,
  { name = route.name, settings }: CaptureOptions = {},
) {
  renderRoute(route.element, {
    ...route.state,
    theme,
    designLanguage,
    settings: { ...route.state?.settings, ...settings },
  });

  await expect(page.getByTestId('visual-root')).toMatchScreenshot(
    `${name}-${theme.toLowerCase()}-${designLanguage}`,
  );
}

describe('renderer/routes visual regression', () => {
  describe.each(THEME_VARIANTS)('$label', ({ designLanguage, theme }) => {
    it.each(ROUTES)('$name', async (route) => {
      await captureRoute(route, theme, designLanguage);
    });
  });

  describe.each(ACCESSIBILITY_THEMES)('classic %s', (theme) => {
    it.each(DENSE_ROUTES)('$name', async (route) => {
      await captureRoute(route, theme, DesignLanguage.CLASSIC);
    });
  });

  // High contrast is a Classic-only setting rather than a `Theme` value, so it
  // gets its own matrix instead of another entry in ACCESSIBILITY_THEMES.
  describe.each(HIGH_CONTRAST_THEMES)('classic %s high contrast', (theme) => {
    it.each(DENSE_ROUTES)('$name', async (route) => {
      await captureRoute(route, theme, DesignLanguage.CLASSIC, {
        name: `${route.name}-high-contrast`,
        settings: { increaseContrast: true },
      });
    });
  });
});
