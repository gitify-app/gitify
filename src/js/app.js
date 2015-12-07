import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute } from 'react-router';

var AuthStore = require('./stores/auth');
var Navigation = require('./components/navigation');
var SearchBar = require('./components/search');
var LoginPage = require('./components/login');
var NotificationsPage = require('./components/notifications');
var SettingsPage = require('./components/settings');

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
        <Navigation toggleSearch={this.toggleSearch} />
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
  <Router>
    <Route path='/' component={App}>
      <IndexRoute component={NotificationsPage} onEnter={requireAuth} />
      <Route path='/notifications' component={NotificationsPage} />
      <Route path='/login' component={LoginPage} />
      <Route path='/settings' component={SettingsPage} />
      <Route path='*' component={NotFound} />
    </Route>
  </Router>,
  document.getElementById('app')
);
