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
        <div className="flex flex-col pl-14 h-full">
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
              path="/settings"
              element={
                <RequireAuth>
                  <SettingsRoute />
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
