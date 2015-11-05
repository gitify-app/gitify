var React = require('react');
var ReactDOM = require('react-dom');
var Router = require('react-router');

var AuthStore = require('./stores/auth');
var Navigation = require('./components/navigation');
var SearchBar = require('./components/search');
var LoginPage = require('./components/login');
var NotificationsPage = require('./components/notifications');
var SettingsPage = require('./components/settings');

var Route = Router.Route;
var NotFoundRoute = Router.NotFoundRoute;
var DefaultRoute = Router.DefaultRoute;
var RouteHandler = Router.RouteHandler;

var App = React.createClass({
  statics: {
    willTransitionTo: function (transition) {
      if (transition.path !== '/login' && !AuthStore.authStatus()) {
        console.log('Not logged in. Redirecting to login.');
        transition.redirect('login', {});
      }
    }
  },

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
        <RouteHandler />
      </div>
    );
  }
});

var NotFound = React.createClass({
  render: function () {
    return <h2>Not found</h2>;
  }
});

var routes = (
  <Route handler={App} path="/">
    <DefaultRoute handler={NotificationsPage} />
    <Route name="login" handler={LoginPage}/>
    <Route name="notifications" handler={NotificationsPage}/>
    <Route name="settings" handler={SettingsPage}/>
    <NotFoundRoute handler={NotFound}/>
  </Route>
);

Router.run(routes, function (Handler) {
  ReactDOM.render(<Handler/>, document.getElementById('app'));
});
