var React = require('react');
var Reflux = require('reflux');
var Loading = require('reloading');

var Actions = require('../actions/actions');

var Notifications = React.createClass({

  render: function () {
    return (
      <div className="container-fluid main-container">
        <h1>Notifications</h1>
      </div>
    );
  }
});

module.exports = Notifications;
