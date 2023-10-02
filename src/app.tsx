import React, { useContext } from 'react';
import {
  Navigate,
  HashRouter as Router,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';

import { AppContext, AppProvider } from './context/App';
import { Loading } from './components/Loading';
import { LoginEnterpriseRoute } from './routes/LoginEnterprise';
import { LoginRoute } from './routes/Login';
import { LoginWithToken } from './routes/LoginWithToken';
import { NotificationsRoute } from './routes/Notifications';
import { SettingsRoute } from './routes/Settings';
import { Sidebar } from './components/Sidebar';

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
            <Route path="/login" element={<LoginRoute />} />
            <Route
              path="/login-enterprise"
              element={<LoginEnterpriseRoute />}
            />
            <Route path="/login-token" element={<LoginWithToken />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
};
