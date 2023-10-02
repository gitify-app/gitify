import React, { useContext } from 'react';
import {
  Redirect,
  HashRouter as Router,
  Route,
  Switch,
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
    <Redirect to={{ pathname: '/login', state: { from: location } }} />
  );
}

export const App = () => {
  return (
    <AppProvider>
      <Router>
        <div className="flex flex-col pl-14 h-full">
          <Loading />
          <Sidebar />

          <Switch>
            <Route path="/" exact>
              <RequireAuth>
                <NotificationsRoute />
              </RequireAuth>
            </Route>
            <Route path="/settings" exact>
              <RequireAuth>
                <SettingsRoute />
              </RequireAuth>
            </Route>
            <Route path="/login">
              <LoginRoute />
            </Route>
            <Route path="/login">
              <LoginRoute />
            </Route>
            <Route path="/login-enterprise">
              <LoginEnterpriseRoute />
            </Route>
            <Route path="/login-token">
              <LoginWithToken />
            </Route>
          </Switch>
        </div>
      </Router>
    </AppProvider>
  );
};
