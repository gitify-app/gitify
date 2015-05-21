var React = require('react');
var Reflux = require('reflux');
var Loading = require('reloading');

var Actions = require('../actions/actions');
var NotificationsStore = require('../stores/notifications');

var Notifications = React.createClass({
  mixins: [
    Reflux.connect(NotificationsStore, 'notifications'),
    Reflux.listenTo(Actions.getNotifications.completed, 'completedNotifications'),
    Reflux.listenTo(Actions.getNotifications.failed, 'completedNotifications'),
  ],

  getInitialState: function() {
    return {
      notifications: undefined
    };
  },

  componentWillMount: function() {
    Actions.getNotifications();
  },

  render: function () {
    return (
      <div className="container-fluid main-container">
        <h1>Notifications</h1>
      </div>
    );
  }
});

module.exports = Notifications;
