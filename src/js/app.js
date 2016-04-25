import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';

import LoginPage from './components/login';
import Navigation from './components/navigation';
import NotificationsPage from './components/notifications';
import SettingsPage from './components/settings';

var AuthStore = require('./stores/auth');
var SearchBar = require('./components/search');

var App = React.createClass({
  getInitialState: function () {
    return {
      showSearch: false
    };
  },

  toggleSearch: function () {
    this.setState({
      showSearch: !this.state.showSearch
    });
  },

  render: function () {
    return (
      <div>
        <Navigation
          location={this.props.location}
          toggleSearch={this.toggleSearch}
          showSearch={this.state.showSearch} />
        <SearchBar showSearch={this.state.showSearch} />
        {this.props.children}
      </div>
    );
  }
});

var NotFound = React.createClass({
  render: function () {
    return <h2>Not found</h2>;
  }
});

function requireAuth (nextState, replaceState) {
  if (!AuthStore.authStatus()) {
    replaceState(null, '/login/');
  }
}

render(
  <Router history={hashHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={NotificationsPage} onEnter={requireAuth} />
      <Route path="/notifications" component={NotificationsPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="*" component={NotFound} />
    </Route>
  </Router>,
  document.getElementById('app')
);
