import _ from 'underscore';
import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { connect } from 'react-redux';


const shell = window.require('electron').shell;

import AllRead from './all-read';
import Oops from './oops';
import Repository from './repository';

export class NotificationsPage extends React.Component {
  openBrowser() {
    shell.openExternal('http://www.github.com/manosim/gitify');
  }

  render() {
    const wrapperClass = 'container-fluid main-container notifications';
    const notificationsEmpty = this.props.notifications.isEmpty();

    if (this.props.failed) {
      return <Oops />;
    }

    if (notificationsEmpty) {
      return <AllRead />;
    };

    const groupedNotifications = this.props.notifications.groupBy((object) => (
      object.getIn(['repository', 'full_name']))
    );

    return (
      <div className={wrapperClass + (notificationsEmpty ? ' all-read' : '')}>
        <ReactCSSTransitionGroup
          transitionName="repository"
          transitionEnter={false}
          transitionLeaveTimeout={325}>
          {groupedNotifications.map((obj, key) => {
            return <Repository repo={obj} repoName={key} key={key} />;
          })}
        </ReactCSSTransitionGroup>

        {!_.isEmpty(groupedNotifications) && !this.props.hasStarred ? (
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
    hasStarred: state.settings.hasStarred,
    failed: state.notifications.get('failed'),
    notifications: state.notifications.get('response')
  };
};

export default connect(mapStateToProps, null)(NotificationsPage);
