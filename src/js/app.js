var React = require('react');
var Router = require('react-router');

var Navigation = require('./components/navigation');

var App = React.createClass({
  statics: {
    willTransitionTo: function (transition) {
      if (transition.path !== '/login' && !AuthStore.authStatus()) {
        console.log("Not logged in. Redirecting to login.");
        transition.redirect('login', {});
      }
    }
  },

  render: function () {
    return (
      <div>
        <Navigation />
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
    <DefaultRoute handler={RepositoriesPage} />
    <Route name="login" handler={NotFound}/>
    <NotFoundRoute handler={NotFound}/>
  </Route>
);

Router.run(routes, function (Handler) {
  React.render(<Handler/>, document.getElementById('app'));
});
