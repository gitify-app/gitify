import { createHashRouter, Navigate, type RouteObject } from 'react-router';

import { AccountsRoute } from './routes/Accounts';
import { AccountScopesRoute } from './routes/AccountScopes';
import { BitbucketLoginWithPersonalAccessTokenRoute } from './routes/bitbucket/LoginWithPersonalAccessToken';
import { FiltersRoute } from './routes/Filters';
import { GiteaLoginWithPersonalAccessTokenRoute } from './routes/gitea/LoginWithPersonalAccessToken';
import { GitHubLoginWithCustomOAuthAppRoute } from './routes/github/LoginWithCustomOAuthApp';
import { GitHubLoginWithDeviceFlowRoute } from './routes/github/LoginWithDeviceFlow';
import { GitHubLoginWithCLIRoute } from './routes/github/LoginWithGitHubCLI';
import { GitHubLoginWithPersonalAccessTokenRoute } from './routes/github/LoginWithPersonalAccessToken';
import { GitLabLoginWithPersonalAccessTokenRoute } from './routes/gitlab/LoginWithPersonalAccessToken';
import { LoginRoute } from './routes/Login';
import { NotificationsRoute } from './routes/Notifications';
import { ProtectedLayout } from './routes/ProtectedLayout';
import { RootLayout } from './routes/RootLayout';
import { SettingsRoute } from './routes/Settings';

/**
 * The renderer's route table. Exported separately from the router instance so
 * tests can build a memory router from the same routes.
 */
export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      { element: <LoginRoute />, path: 'login' },
      {
        element: <GitHubLoginWithDeviceFlowRoute />,
        path: 'login/github/device-flow',
      },
      { element: <GitHubLoginWithCLIRoute />, path: 'login/github/cli' },
      {
        element: <GitHubLoginWithPersonalAccessTokenRoute />,
        path: 'login/github/personal-access-token',
      },
      {
        element: <GitHubLoginWithCustomOAuthAppRoute />,
        path: 'login/github/custom-oauth-app',
      },
      {
        element: <GiteaLoginWithPersonalAccessTokenRoute />,
        path: 'login/gitea/personal-access-token',
      },
      {
        element: <BitbucketLoginWithPersonalAccessTokenRoute />,
        path: 'login/bitbucket/personal-access-token',
      },
      {
        element: <GitLabLoginWithPersonalAccessTokenRoute />,
        path: 'login/gitlab/personal-access-token',
      },
      {
        element: <ProtectedLayout />,
        children: [
          { element: <NotificationsRoute />, index: true },
          { element: <FiltersRoute />, path: 'filters' },
          { element: <SettingsRoute />, path: 'settings' },
          { element: <AccountsRoute />, path: 'accounts' },
          { element: <AccountScopesRoute />, path: 'account-scopes' },
        ],
      },
      { element: <Navigate replace to="/" />, path: '*' },
    ],
  },
];

export const router = createHashRouter(routes);
