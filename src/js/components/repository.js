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
    this.props.markRepoNotifications(repoSlug);
  }

  render() {
    const avatarUrl = this.props.repo.first().getIn(['repository', 'owner', 'avatar_url']);

    return (
      <div>
        <div className="row repository">
          <div className="col-xs-11 name">
            <img className="avatar" src={avatarUrl} />
            <span onClick={() => this.openBrowser()}>{this.props.repoName}</span>
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
