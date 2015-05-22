var React = require('react');
var Reflux = require('reflux');
var _ = require('underscore');
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
      notifications: {},
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
    var notifications;

    if (!_.isEmpty(this.state.notifications)) {
      notifications = (
        _.map(this.state.notifications, function(repo, i) {
          return (
            <div key={i}>
              <h4>{i}</h4>
              {repo.map(function(as, df) {
                return (
                  <SingleNotification notification={as} key={as.id} />
                );
              })}
            </div>
          );
        })
      );
    } else {
      notifications = (
        <div className="all-read">
          <h2>There are no notifications for you.</h2>
          <h3>All clean!</h3>
        </div>
      );
    }

    return (
      <div className="container-fluid main-container notifications">
        <Loading className='loading-container' shouldShow={this.state.loading}>
          <div className='loading-text'>working on it</div>
        </Loading>
        {notifications}
      </div>
    );
  }
});

module.exports = Notifications;
