import * as React from 'react';
import {
  Redirect,
  HashRouter as Router,
  Route,
  Switch,
} from 'react-router-dom';
import { Provider } from 'react-redux';

import configureStore from './store/configureStore';
import Loading from './components/loading';
import Sidebar from './components/sidebar';

import EnterpriseLoginRoute from './routes/enterprise-login';
import LoginRoute from './routes/login';
import NotificationsRoute from './routes/notifications';
import SettingsRoute from './routes/settings';

// Store
export const store = configureStore();

export const PrivateRoute = ({ component: Component, ...rest }) => {
  // @ts-ignore
  const authReducer = store.getState().auth;
  const isAuthenticated =
    authReducer.token !== null || authReducer.enterpriseAccounts.length > 0;

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{ pathname: '/login', state: { from: props.location } }}
          />
        )
      }
    />
  );
};

export const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <div className="flex flex-col pl-14 h-full">
          <Loading />
          <Sidebar />

          <Switch>
            <PrivateRoute path="/" exact component={NotificationsRoute} />
            <PrivateRoute path="/settings" exact component={SettingsRoute} />
            <Route path="/login" component={LoginRoute} />
            <Route path="/enterpriselogin" component={EnterpriseLoginRoute} />
          </Switch>
        </div>
      </Router>
    </Provider>
  );
};
