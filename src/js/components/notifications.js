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
    Reflux.listenTo(Actions.getNotifications.failed, 'failedNotifications')
  ],

  getInitialState: function () {
    return {
      notifications: [],
      loading: true,
      errors: false
    };
  },

  componentWillMount: function () {
    Actions.getNotifications();
  },

  completedNotifications: function () {
    this.setState({
      loading: false,
      errors: false
    });
  },

  failedNotifications: function () {
    this.setState({
      loading: false,
      errors: true
    });
  },

  render: function () {
    var notifications, errors;
    var wrapperClass = 'container-fluid main-container notifications';

    if (this.state.errors) {
      wrapperClass += ' errored';
      errors = (
        <div>
          <h3>Oops something went wrong.</h3>
          <h4>Couldn't get your notifications.</h4>
          <img className='img-responsive emoji' src='images/error.png' />
        </div>
      );
    } else {
      if (_.isEmpty(this.state.notifications)) {
        wrapperClass += ' all-read';
        notifications = (
          <div>
            <h2>There are no notifications for you.</h2>
            <h3>All clean!</h3>
            <img className='img-responsive emoji' src='images/all-read.png' />
          </div>
        );
      } else {
        notifications = (
          this.state.notifications.map(function (obj) {
            var repoFullName = obj[0].repository.full_name;
            return <Repository repo={obj} repoName={repoFullName} key={repoFullName} />;
          })
        );
      }
    }

    return (
      <div className={wrapperClass}>
        <Loading className='loading-container' shouldShow={this.state.loading}>
          <div className='loading-text'>working on it</div>
        </Loading>
        {errors}
        {notifications}
      </div>
    );
  }
});

module.exports = Notifications;
