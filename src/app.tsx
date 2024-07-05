import { useContext } from 'react';
import {
  Navigate,
  Route,
  HashRouter as Router,
  Routes,
  useLocation,
} from 'react-router-dom';
import { Loading } from './components/Loading';
import { Sidebar } from './components/Sidebar';
import { AppContext, AppProvider } from './context/App';
import { AccountsRoute } from './routes/Accounts';
import { FiltersRoute } from './routes/Filters';
import { LoginRoute } from './routes/Login';
import { LoginWithOAuthApp } from './routes/LoginWithOAuthApp';
import { LoginWithPersonalAccessToken } from './routes/LoginWithPersonalAccessToken';
import { NotificationsRoute } from './routes/Notifications';
import { SettingsRoute } from './routes/Settings';

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
    <AppProvider>
      <Router>
        <div className="flex h-full overflow-y-auto flex-col pl-14">
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
              element={<LoginWithPersonalAccessToken />}
            />
            <Route path="/login-oauth-app" element={<LoginWithOAuthApp />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
};
