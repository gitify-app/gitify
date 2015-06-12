var React = require('react');
var Router = require('react-router');

var AuthStore = require('./stores/auth');
var Navigation = require('./components/navigation');
var Footer = require('./components/footer');
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

  render: function () {
    return (
      <div>
        <Navigation />
        <RouteHandler />
        <Footer />
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
  React.render(<Handler/>, document.getElementById('app'));
});
