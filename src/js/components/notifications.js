var React = require('react');
var Reflux = require('reflux');
var Loading = require('reloading');
var _ = require('underscore');

var Actions = require('../actions/actions');
var NotificationsStore = require('../stores/notifications');
var SearchStore = require('../stores/search');
var Repository = require('../components/repository');

var Notifications = React.createClass({
  areIn: function (repoFullName, searchTerm) {
    return repoFullName.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0;
  },

  matchesSearchTerm: function (obj) {
    var searchTerm = this.state.searchTerm.replace(/^\s+/, '').replace(/\s+$/, '');
    var searchTerms = searchTerm.split(/\s+/);
    return _.all(searchTerms, this.areIn.bind(null, obj.repository.full_name));
  },

  mixins: [
    Reflux.connect(NotificationsStore, 'notifications'),
    Reflux.connect(SearchStore, 'searchTerm'),
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
    var notificationsEmpty = _.isEmpty(this.state.notifications);

    if (this.state.errors) {
      errors = (
        <div>
          <h3>Oops something went wrong.</h3>
          <h4>Couldn't get your notifications.</h4>
          <img className='img-responsive emoji' src='images/error.png' />
        </div>
      );
    } else {
      if (notificationsEmpty) {
        notifications = (
          <div>
            <h2>There are no notifications for you.</h2>
            <h3>All clean!</h3>
            <img className='img-responsive emoji' src='images/all-read.png' />
          </div>
        );
      } else {
        if (this.state.searchTerm) {
          notifications = _.filter(this.state.notifications, this.matchesSearchTerm);
        } else {
          notifications = this.state.notifications;
        }

        if (notifications.length) {

          var groupedNotifications = _.groupBy(notifications, function (object) {
            return object.repository.full_name;
          });

          notifications = (
            _.map(groupedNotifications, function (obj) {
              var repoFullName = obj[0].repository.full_name;
              return <Repository repo={obj} repoName={repoFullName} key={repoFullName} />;
            })
          );
        } else {
          notificationsEmpty = true;
          errors = (
            <div>
              <h3>No Search Results.</h3>
              <h4>No Organisations or Repositories match your search term.</h4>
              <img className='img-responsive emoji' src='images/all-read.png' />
            </div>
          );
        }
      }
    }

    return (
      <div className={
          wrapperClass +
          (this.state.errors ? ' errored' : '') +
          (notificationsEmpty ? ' all-read' : '')
        }>
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
