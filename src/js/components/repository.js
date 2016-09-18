import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { connect } from 'react-redux';
const shell = window.require('electron').shell;

import { markRepoNotifications } from '../actions';
import SingleNotification from './notification';

export class Repository extends React.Component {
  openBrowser() {
    var url = this.props.repo.first().getIn(['repository', 'html_url']);
    shell.openExternal(url);
  }

  markRepoAsRead() {
    const repoSlug = this.props.repo.first().getIn(['repository', 'full_name']);
    // this.props.markRepoNotifications(repoSlug);
  }

  render() {
    var organisationName, repositoryName;
    const avatarUrl = this.props.repo.first().getIn(['repository', 'owner', 'avatar_url']);

    if (typeof this.props.repoName === 'string') {
      var splitName = this.props.repoName.split('/');
      organisationName = splitName[0];
      repositoryName = splitName[1];
    }

    return (
      <div>
        <div className="row repository">
          <div className="col-xs-2"><img className="avatar" src={avatarUrl} /></div>
          <div className="col-xs-9 name" onClick={() => this.openBrowser()}>
            <span>{'/' + repositoryName}</span>
            <span>{organisationName}</span>
          </div>
          <div className="col-xs-1 check-wrapper">
            <span
              title="Mark Repository as Read"
              className="octicon octicon-check"
              onClick={() => this.markRepoAsRead()} />
          </div>
        </div>

        <ReactCSSTransitionGroup
          transitionName="notification"
          transitionEnter={false}
          transitionLeaveTimeout={325}>
          {this.props.repo.map(function (obj, key) {
            return <SingleNotification notification={obj} key={obj.get('id')} />;
          })}
        </ReactCSSTransitionGroup>

      </div>
    );
  }
};

export default connect(null, { markRepoNotifications })(Repository);
