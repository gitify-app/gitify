import * as React from 'react';
import {
  Redirect,
  HashRouter as Router,
  Route,
  Switch,
} from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';

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
    authReducer.get('token') !== null ||
    authReducer.get('enterpriseAccounts').size > 0;

  return (
    <Route
      {...rest}
      render={props =>
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

const theme = {
  primary: '#555B6E',
  success: '#69B578',
  info: '#8BA9C6',
  warning: '#FCAA67',
  danger: '#B7524F',

  grayLighter: '#f9fafa',
  grayLight: '#eceeef',

  purple: '#555b6e',
  purpleDark: '#3f4351',
};

export const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <Router>
          <div className="wrapper">
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
      </ThemeProvider>
    </Provider>
  );
};
