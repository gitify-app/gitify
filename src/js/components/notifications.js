import _ from 'underscore';
import React from 'react';
import { connect } from 'react-redux';
import Loading from 'reloading';

const shell = window.require('electron').shell;

var Repository = require('./repository');

import { fetchNotifications } from '../actions';

class NotificationsPage extends React.Component {
  componentWillMount() {
    this.props.fetchNotifications();
  }

  areIn(repoFullName, searchTerm) {
    return repoFullName.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0;
  }

  matchesSearchTerm(obj) {
    var searchTerm = this.props.searchQuery.replace(/^\s+/, '').replace(/\s+$/, '');
    var searchTerms = searchTerm.split(/\s+/);
    return _.all(searchTerms, this.areIn.bind(null, obj.repository.full_name));
  }

  openBrowser() {
    shell.openExternal('http://www.github.com/ekonstantinidis/gitify');
  }

  render() {
    var notifications, errors;
    var wrapperClass = 'container-fluid main-container notifications';
    var notificationsEmpty = _.isEmpty(this.props.notifications);

    if (this.props.failed) {
      errors = (
        <div>
          <h3>Oops something went wrong.</h3>
          <h4>Couldn't get your notifications.</h4>
          <img className="img-responsive emoji" src="images/error.png" />
        </div>
      );
    } else {
      if (notificationsEmpty) {
        notifications = (
          <div>
            <h2>Awesome! <span className="what">&nbsp;</span></h2>
            <h3>No new notifications.</h3>
            <img className="img-responsive emoji" src="images/all-read.png" />
          </div>
        );
      } else {
        if (this.props.searchQuery) {
          notifications = _.filter(this.props.notifications, this.matchesSearchTerm.bind(this));
        } else {
          notifications = this.props.notifications;
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
              <img className="img-responsive emoji" src="images/all-read.png" />
            </div>
          );
        }
      }
    }

    return (
      <div className={
          wrapperClass +
          (this.props.failed ? ' errored' : '') +
          (notificationsEmpty ? ' all-read' : '')
        }>
        <Loading className="loading-container" shouldShow={this.props.isFetching}>
          <div className="loading-text">working on it</div>
        </Loading>
        {errors}
        {notifications}
        {notifications && notifications.length ? (
          <div className="fork" onClick={this.openBrowser}>
            <i className="fa fa-github" /> Star Gitify on GitHub
          </div>
        ) : null}
      </div>
    );
  }
};

function mapStateToProps(state) {
  return {
    failed: state.notifications.failed,
    isFetching: state.notifications.isFetching,
    notifications: state.notifications.response,
    searchQuery: state.searchFilter.query
  };
};

export default connect(mapStateToProps, { fetchNotifications })(NotificationsPage);
