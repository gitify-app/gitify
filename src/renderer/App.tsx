import {
  Navigate,
  Route,
  HashRouter as Router,
  Routes,
  useLocation,
} from 'react-router-dom';

import { BaseStyles, ThemeProvider } from '@primer/react';

import './App.css';

import { useEffect } from 'react';

import { QueryClientProvider } from '@tanstack/react-query';

import { AppProvider } from './context/App';
import { AccountsRoute } from './routes/Accounts';
import { FiltersRoute } from './routes/Filters';
import { LoginRoute } from './routes/Login';
import { LoginWithDeviceFlowRoute } from './routes/LoginWithDeviceFlow';
import { LoginWithOAuthAppRoute } from './routes/LoginWithOAuthApp';
import { LoginWithPersonalAccessTokenRoute } from './routes/LoginWithPersonalAccessToken';
import { NotificationsRoute } from './routes/Notifications';
import { SettingsRoute } from './routes/Settings';
import { useAccountsStore } from './stores';
import { initializeStoreSubscriptions } from './stores/subscriptions';

import { GlobalShortcuts } from './components/GlobalShortcuts';
import { AppLayout } from './components/layout/AppLayout';

import { queryClient } from './utils/api/client';
import { rendererLogError } from './utils/logger';
import { migrateContextToZustand } from './utils/storage';

// Run migration from Context storage to Zustand stores (async)
migrateContextToZustand().catch((error) => {
  rendererLogError('App', 'Failed to migrate storage', error);
});

function RequireAuth({ children }) {
  const location = useLocation();

  const isLoggedIn = useAccountsStore((s) => s.isLoggedIn());

  return isLoggedIn ? (
    children
  ) : (
    <Navigate replace state={{ from: location }} to="/login" />
  );
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
                  <Route element={<LoginRoute />} path="/login" />
                  <Route
                    element={<LoginWithDeviceFlowRoute />}
                    path="/login-device-flow"
                  />
                  <Route
                    element={<LoginWithPersonalAccessTokenRoute />}
                    path="/login-personal-access-token"
                  />
                  <Route
                    element={<LoginWithOAuthAppRoute />}
                    path="/login-oauth-app"
                  />
                </Routes>
              </AppLayout>
            </Router>
          </AppProvider>
        </BaseStyles>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
