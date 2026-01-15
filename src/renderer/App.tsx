import {
  Navigate,
  Route,
  HashRouter as Router,
  Routes,
  useLocation,
} from 'react-router-dom';

import { BaseStyles, ThemeProvider } from '@primer/react';

import { AppProvider } from './context/App';
import { AccountsRoute } from './routes/Accounts';
import { FiltersRoute } from './routes/Filters';
import { LoginRoute } from './routes/Login';
import { LoginWithOAuthAppRoute } from './routes/LoginWithOAuthApp';
import { LoginWithPersonalAccessTokenRoute } from './routes/LoginWithPersonalAccessToken';
import { NotificationsRoute } from './routes/Notifications';
import { SettingsRoute } from './routes/Settings';

import { GlobalShortcuts } from './components/GlobalShortcuts';
import { AppLayout } from './components/layout/AppLayout';

import './App.css';

import { useAppContext } from './hooks/useAppContext';

function RequireAuth({ children }) {
  const location = useLocation();

  const { isLoggedIn } = useAppContext();

  return isLoggedIn ? (
    children
  ) : (
    <Navigate replace state={{ from: location }} to="/login" />
  );
}

export const App = () => {
  return (
    <ThemeProvider>
      <BaseStyles>
        <AppProvider>
          <GlobalShortcuts />
          <Router>
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
  );
};
