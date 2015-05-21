var React = require('react');
var Reflux = require('reflux');
var Loading = require('reloading');

var Actions = require('../actions/actions');
var NotificationsStore = require('../stores/notifications');
var SingleNotification = require('../components/notification');

var Notifications = React.createClass({
  mixins: [
    Reflux.connect(NotificationsStore, 'notifications'),
    Reflux.listenTo(Actions.getNotifications.completed, 'completedNotifications'),
    Reflux.listenTo(Actions.getNotifications.failed, 'completedNotifications'),
  ],

  getInitialState: function() {
    return {
      notifications: [],
      loading: true
    };
  },

  componentWillMount: function() {
    Actions.getNotifications();
  },

  completedNotifications: function () {
    this.setState( {loading: false } );
  },

  render: function () {
    return (
      <div className="container-fluid main-container notifications">
        <Loading className='loading-container' shouldShow={this.state.loading}>
          <div className='loading-text'>working on it</div>
        </Loading>
        {this.state.notifications.map(function(object, i){
          return <SingleNotification key={object.id} notification={object} />;
        })}
      </div>
    );
  }
});

module.exports = Notifications;
