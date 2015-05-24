var React = require('react');
var Reflux = require('reflux');
var Loading = require('reloading');
var _ = require('underscore');
var remote = window.require('remote');
var shell = remote.require('shell');

var Actions = require('../actions/actions');
var NotificationsStore = require('../stores/notifications');
var Repository = require('../components/repository');

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
    var notifications;
    var wrapperClass = 'container-fluid main-container notifications';
    var self = this;

    if (_.isEmpty(this.state.notifications)) {
      wrapperClass += ' all-read';
      notifications = (
        <div>
          <h2>There are no notifications for you.</h2>
          <h3>All clean!</h3>
          <img className='img-responsive emoji' src='images/rocket.png' />
        </div>
      );
    } else {
      notifications = (
        this.state.notifications.map(function(obj, i) {
          console.log(obj);
          var repoFullName = obj[0].repository.full_name;
          return <Repository repo={obj} repoName={repoFullName} key={repoFullName} />;
        })
      );
    }

    return (
      <div className={wrapperClass}>
        <Loading className='loading-container' shouldShow={this.state.loading}>
          <div className='loading-text'>working on it</div>
        </Loading>
        {notifications}
      </div>
    );
  }
});

module.exports = Notifications;
