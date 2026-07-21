import { useEffect } from 'react';
import { Navigate, Route, HashRouter as Router, Routes, useLocation } from 'react-router-dom';

import { BaseStyles, ThemeProvider } from '@primer/react';

import { QueryClientProvider } from '@tanstack/react-query';

import { AccountsRoute } from './routes/Accounts';
import { AccountScopesRoute } from './routes/AccountScopes';
import { BitbucketLoginWithPersonalAccessTokenRoute } from './routes/bitbucket/LoginWithPersonalAccessToken';
import { FiltersRoute } from './routes/Filters';
import { GiteaLoginWithPersonalAccessTokenRoute } from './routes/gitea/LoginWithPersonalAccessToken';
import { GitHubLoginWithDeviceFlowRoute } from './routes/github/LoginWithDeviceFlow';
import { GitHubLoginWithOAuthAppRoute } from './routes/github/LoginWithOAuthApp';
import { GitHubLoginWithPersonalAccessTokenRoute } from './routes/github/LoginWithPersonalAccessToken';
import { LoginRoute } from './routes/Login';
import { NotificationsRoute } from './routes/Notifications';
import { SettingsRoute } from './routes/Settings';
import { useAccountsStore } from './stores';
import { initializeStoreSubscriptions } from './stores/subscriptions';

import { GlobalEffects } from './components/GlobalEffects';
import { GlobalShortcuts } from './components/GlobalShortcuts';

import './App.css';
import { AppLayout } from './components/layout/AppLayout';

import { queryClient } from './utils/api/queryClient';
import { migrateLegacyStoreToZustand } from './utils/core/storage';

// Run migration from legacy local storage to Zustand stores
migrateLegacyStoreToZustand();

function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const isLoggedIn = useAccountsStore((s) => s.isLoggedIn());

  return isLoggedIn ? children : <Navigate replace state={{ from: location }} to="/login" />;
}

export const App = () => {
  // Initialize store subscriptions with proper cleanup
  useEffect(() => {
    const cleanup = initializeStoreSubscriptions();
    return cleanup;
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BaseStyles>
          <GlobalEffects />
          <Router>
            <GlobalShortcuts />
            <AppLayout>
              <Routes>
                <Route
                  element={
                    <RequireAuth>
                      <NotificationsRoute />
                    </RequireAuth>
                  }
                  path="/"
                />
                <Route
                  element={
                    <RequireAuth>
                      <FiltersRoute />
                    </RequireAuth>
                  }
                  path="/filters"
                />
                <Route
                  element={
                    <RequireAuth>
                      <SettingsRoute />
                    </RequireAuth>
                  }
                  path="/settings"
                />
                <Route
                  element={
                    <RequireAuth>
                      <AccountsRoute />
                    </RequireAuth>
                  }
                  path="/accounts"
                />
                <Route
                  element={
                    <RequireAuth>
                      <AccountScopesRoute />
                    </RequireAuth>
                  }
                  path="/account-scopes"
                />
                <Route element={<LoginRoute />} path="/login" />
                <Route
                  element={<GitHubLoginWithDeviceFlowRoute />}
                  path="/login/github/device-flow"
                />
                <Route
                  element={<GitHubLoginWithPersonalAccessTokenRoute />}
                  path="/login/github/personal-access-token"
                />
                <Route element={<GitHubLoginWithOAuthAppRoute />} path="/login/github/oauth-app" />
                <Route
                  element={<GiteaLoginWithPersonalAccessTokenRoute />}
                  path="/login/gitea/personal-access-token"
                />
                <Route
                  element={<BitbucketLoginWithPersonalAccessTokenRoute />}
                  path="/login/bitbucket/personal-access-token"
                />
              </Routes>
            </AppLayout>
          </Router>
        </BaseStyles>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
