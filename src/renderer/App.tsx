import { Navigate, Route, HashRouter as Router, Routes, useLocation } from 'react-router-dom';

import { BaseStyles, ThemeProvider } from '@primer/react';

import { AppProvider } from './context/App';
import { useAppContext } from './hooks/useAppContext';
import { AccountsRoute } from './routes/Accounts';
import { AccountScopesRoute } from './routes/AccountScopes';
import { FiltersRoute } from './routes/Filters';
import { GiteaLoginWithPersonalAccessTokenRoute } from './routes/gitea/LoginWithPersonalAccessToken';
import { GitHubLoginWithDeviceFlowRoute } from './routes/github/LoginWithDeviceFlow';
import { GitHubLoginWithOAuthAppRoute } from './routes/github/LoginWithOAuthApp';
import { GitHubLoginWithPersonalAccessTokenRoute } from './routes/github/LoginWithPersonalAccessToken';
import { LoginRoute } from './routes/Login';
import { NotificationsRoute } from './routes/Notifications';
import { SettingsRoute } from './routes/Settings';

import { GlobalShortcuts } from './components/GlobalShortcuts';

import './App.css';
import { AppLayout } from './components/layout/AppLayout';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const { isLoggedIn } = useAppContext();

  return isLoggedIn ? children : <Navigate replace state={{ from: location }} to="/login" />;
}

export const App = () => {
  return (
    <ThemeProvider>
      <BaseStyles>
        <AppProvider>
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
              </Routes>
            </AppLayout>
          </Router>
        </AppProvider>
      </BaseStyles>
    </ThemeProvider>
  );
};
