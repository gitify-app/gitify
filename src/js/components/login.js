var React = require('react');
var Reflux = require('reflux');
var Loading = require('reloading');

var Actions = require('../actions/actions');

var Login = React.createClass({

  render: function () {
    return (
      <div className="container-fluid main-container">
        <h1>Login</h1>
      </div>
    );
  }
});

module.exports = Login;
