import '../scss/app.scss';

import React from 'react';
import ReactDOM from 'react-dom';
import {
  Redirect,
  HashRouter as Router,
  Route,
  Switch,
} from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';

const { ipcRenderer } = require('electron');

import { toggleSettingsModal } from './actions';
import configureStore from './store/configureStore';
import Sidebar from './components/sidebar';
import Loading from './components/loading';
import LoginPage from './routes/login';
import NotificationsRoute from './routes/notifications';
import EnterpriseLoginPage from './routes/enterprise-login';
import SettingsModal from './components/settings-modal';

// Store
const store = configureStore();

ipcRenderer.on('toggle-settings', () => {
  store.dispatch(toggleSettingsModal());
});

export const PrivateRoute = ({ component: Component, ...rest }) => {
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

ReactDOM.render(
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <Router>
        <div className="wrapper">
          <Loading />
          <SettingsModal />
          <Sidebar />

          <Switch>
            <PrivateRoute path="/" exact component={NotificationsRoute} />
            <Route path="/login" component={LoginPage} />
            <Route path="/enterpriselogin" component={EnterpriseLoginPage} />
          </Switch>
        </div>
      </Router>
    </ThemeProvider>
  </Provider>,
  document.getElementById('gitify')
);
