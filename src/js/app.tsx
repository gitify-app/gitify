import * as React from 'react';
import {
  Redirect,
  HashRouter as Router,
  Route,
  Switch,
} from 'react-router-dom';
import { Provider } from 'react-redux';
import styled, {
  ThemeProvider,
  createGlobalStyle,
  DefaultTheme,
} from 'styled-components';

import configureStore from './store/configureStore';
import Loading from './components/loading';
import Sidebar, { SIDEBAR_WIDTH } from './components/sidebar';

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

const theme: DefaultTheme = {
  borderRadius: '3px',

  primary: '#203354',
  success: '#2CC966',
  info: '#8BA9C6',
  warning: '#FCAA67',
  danger: '#B7524F',

  grayLighter: '#f9fafa',
  grayLight: '#eceeef',
  grayDarker: '#3d3f41',
  grayDark: '#55595C',

  primaryDark: '#071A3B',
};

const GlobalStyle = createGlobalStyle`
  html,
  body {
    -webkit-user-select: none;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
      'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    margin: 0;
    cursor: default;
  }

  button {
    &:hover {
      cursor: pointer;
    }
  }

  #nprogress {
    pointer-events: none;
  
    .bar {
      position: fixed;
      top: 0;
      left: ${SIDEBAR_WIDTH};
      z-index: 1031;
      background: ${props => props.theme.primary};
  
      width: 100%;
      height: 2px;
    }
  }
`;

const Wrapper = styled.div`
  padding-left: ${SIDEBAR_WIDTH};
`;

export const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <Router>
          <GlobalStyle />
          <Wrapper>
            <Loading />
            <Sidebar />

            <Switch>
              <PrivateRoute path="/" exact component={NotificationsRoute} />
              <PrivateRoute path="/settings" exact component={SettingsRoute} />
              <Route path="/login" component={LoginRoute} />
              <Route path="/enterpriselogin" component={EnterpriseLoginRoute} />
            </Switch>
          </Wrapper>
        </Router>
      </ThemeProvider>
    </Provider>
  );
};
