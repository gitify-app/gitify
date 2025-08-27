import { useContext } from 'react';
import {
  Navigate,
  Route,
  HashRouter as Router,
  Routes,
  useLocation,
} from 'react-router-dom';

import { BaseStyles, ThemeProvider } from '@primer/react';

import { AppLayout } from './components/layout/AppLayout';
import { AppContext, AppProvider } from './context/App';
import { AccountsRoute } from './routes/Accounts';
import { FiltersRoute } from './routes/Filters';
import { LoginRoute } from './routes/Login';
import { LoginWithOAuthAppRoute } from './routes/LoginWithOAuthApp';
import { LoginWithPersonalAccessTokenRoute } from './routes/LoginWithPersonalAccessToken';
import { NotificationsRoute } from './routes/Notifications';
import { SettingsRoute } from './routes/Settings';

import './App.css';

function RequireAuth({ children }) {
  const { isLoggedIn } = useContext(AppContext);
  const location = useLocation();

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
