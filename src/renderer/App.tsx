import { useContext } from 'react';
import {
  Navigate,
  Route,
  HashRouter as Router,
  Routes,
  useLocation,
} from 'react-router-dom';

import { BaseStyles, ThemeProvider } from '@primer/react';

import { Loading } from './components/Loading';
import { Sidebar } from './components/Sidebar';
import { AppContext, AppProvider } from './context/App';
import { AccountsRoute } from './routes/Accounts';
import { FiltersRoute } from './routes/Filters';
import { LoginRoute } from './routes/Login';
import { LoginWithOAuthAppRoute } from './routes/LoginWithOAuthApp';
import { LoginWithPersonalAccessTokenRoute } from './routes/LoginWithPersonalAccessToken';
import { NotificationsRoute } from './routes/Notifications';
import { SettingsRoute } from './routes/Settings';

import './App.css';
import {
  DEFAULT_DAY_COLOR_SCHEME,
  DEFAULT_NIGHT_COLOR_SCHEME,
} from './utils/theme';

function RequireAuth({ children }) {
  const { isLoggedIn } = useContext(AppContext);
  const location = useLocation();

  return isLoggedIn ? (
    children
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
}

export const App = () => {
  return (
    <ThemeProvider
      colorMode="auto"
      dayScheme={DEFAULT_DAY_COLOR_SCHEME}
      nightScheme={DEFAULT_NIGHT_COLOR_SCHEME}
    >
      <BaseStyles>
        <AppProvider>
          <Router>
            <div className="flex h-full overflow-x-hidden overflow-y-auto flex-col pl-10 bg-gitify-background">
              <Loading />
              <Sidebar />
              <Routes>
                <Route
                  path="/"
                  element={
                    <RequireAuth>
                      <NotificationsRoute />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/filters"
                  element={
                    <RequireAuth>
                      <FiltersRoute />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <RequireAuth>
                      <SettingsRoute />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/accounts"
                  element={
                    <RequireAuth>
                      <AccountsRoute />
                    </RequireAuth>
                  }
                />
                <Route path="/login" element={<LoginRoute />} />
                <Route
                  path="/login-personal-access-token"
                  element={<LoginWithPersonalAccessTokenRoute />}
                />
                <Route
                  path="/login-oauth-app"
                  element={<LoginWithOAuthAppRoute />}
                />
              </Routes>
            </div>
          </Router>
        </AppProvider>
      </BaseStyles>
    </ThemeProvider>
  );
};
