import React from 'react';  // eslint-disable-line
import { Route, IndexRoute } from 'react-router';

import App from './containers/app';
import LoginPage from './components/login';
import EnterpriseLoginPage from './components/enterprise-login';
import NotificationsPage from './components/notifications';

export class NotFound extends React.Component {
  render() {
    return <h2>Not found</h2>;
  }
};

function requireAuth (store, b, c) {
  const isLoggedIn = store.getState().auth.get('token') !== null;
  if (!isLoggedIn) {
    return (nextState, replace) => {
      replace('/login/');
    };
  }
}

export default (store) => {
  return (
    <Route path="/" component={App}>
      <IndexRoute component={NotificationsPage} onEnter={requireAuth(store)} />
      <Route path="/notifications" component={NotificationsPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/enterpriselogin" component={EnterpriseLoginPage} />
      <Route path="*" component={NotFound} />
    </Route>
  );
};
