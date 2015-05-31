// mock of react router used in the tests
var React = require('react');

function Router (params) {
  this.name = 'router';
  this.params = params;
}

Router.prototype.makeHref = function () {};
Router.prototype.transitionTo = function () {};
Router.prototype.isActive = function () {
  return false;
};

Router.prototype.getCurrentParams = function () {
  return this.params;
};

Router.Link = React.createClass({
  render: function () {
    return (<a/>);
  }
});

module.exports = Router;
