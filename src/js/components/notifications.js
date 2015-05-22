var React = require('react');
var Reflux = require('reflux');
var Loading = require('reloading');
var _ = require('underscore');
var remote = window.require('remote');
var shell = remote.require('shell');

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

  openRepoBrowser: function (e) {
    var url = this.state.notifications[e][0].repository.html_url;
    shell.openExternal(url);
  },

  render: function () {
    var notifications;
    var self = this;

    if (!_.isEmpty(this.state.notifications)) {
      notifications = (
        _.map(this.state.notifications, function(repo, i) {
          return (
            <div key={i}>
              <h4 onClick={self.openRepoBrowser.bind(self, i)}>{i}</h4>
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
