import React from 'react'; // eslint-disable-line
import ReactDOM from 'react-dom';
import { Redirect, HashRouter as Router, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';

const { ipcRenderer } = require('electron');

import { toggleSettingsModal } from './actions';
import configureStore from './store/configureStore';
import Sidebar from './components/sidebar';
import Loading from './components/loading';
import LoginPage from './components/login';
import NotificationsPage from './components/notifications';
import SettingsModal from './components/settings-modal';

// Store
const store = configureStore();

ipcRenderer.on('toggle-settings', (event) => {
  store.dispatch(toggleSettingsModal());
});

export class NotFound extends React.Component {
  render() {
    return <h2>Not found</h2>;
  }
};

const PrivateRoute = ({ component: Component, ...rest }) => {
  const isAuthenticated = store.getState().auth.get('token') !== null;

  return (
    <Route {...rest} render={props => (
      isAuthenticated ? (
        <Component {...props}/>
      ) : (
        <Redirect to={{
          pathname: '/login',
          state: { from: props.location }
        }}/>
      )
    )}/>
  );
};

ReactDOM.render(
  <Provider store={store}>
    <Router>

      <div className="wrapper">
        <Loading />
        <SettingsModal />
        <Sidebar />

        <Switch>
          <PrivateRoute path="/" exact component={NotificationsPage} />
          <Route path="/login" component={LoginPage} />
          <Route component={NotFound}/>
        </Switch>
      </div>

    </Router>
  </Provider>,
  document.getElementById('gitify')
);
