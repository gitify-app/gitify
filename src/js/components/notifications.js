import _ from 'underscore';
import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { connect } from 'react-redux';


const shell = window.require('electron').shell;

import AllRead from './all-read';
import Oops from './oops';
import Repository from './repository';

export class NotificationsPage extends React.Component {
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
    const wrapperClass = 'container-fluid main-container notifications';
    const notificationsEmpty = _.isEmpty(this.props.notifications);

    if (this.props.failed) {
      return <Oops />;
    }

    if (notificationsEmpty && !this.props.searchQuery) {
      return <AllRead />;
    };

    const notifications = this.props.searchQuery ?
      _.filter(this.props.notifications, this.matchesSearchTerm.bind(this)) : this.props.notifications;
    var groupedNotifications = _.groupBy(notifications, (object) => object.repository.full_name);

    if (_.isEmpty(groupedNotifications) && this.props.searchQuery) {
      return (
        <div className={wrapperClass + ' all-read'}>
          <h3>No Search Results.</h3>
          <h4>No Organisations or Repositories match your search term.</h4>
        </div>
      );
    };

    return (
      <div className={wrapperClass + (notificationsEmpty ? ' all-read' : '')}>
        <ReactCSSTransitionGroup
          transitionName="repository"
          transitionEnter={false}
          transitionLeaveTimeout={325}>
          {_.map(groupedNotifications, (obj, key) => {
            const repoFullName = obj[0].repository.full_name;
            return <Repository repo={obj} repoName={repoFullName} key={key} />;
          })}
        </ReactCSSTransitionGroup>

        {!_.isEmpty(groupedNotifications) ? (
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
    notifications: state.notifications.response,
    searchQuery: state.searchFilter.query
  };
};

export default connect(mapStateToProps, null)(NotificationsPage);
