const { shell } = require('electron');

import React from 'react';
import PropTypes from 'prop-types';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { connect } from 'react-redux';
import Octicon, { check } from 'octicons-react';

import { markRepoNotifications } from '../actions';
import SingleNotification from './notification';

export class RepositoryNotifications extends React.Component {
  static propTypes = {
    hostname: PropTypes.string.isRequired,
    repo: PropTypes.any.isRequired,
    repoName: PropTypes.string.isRequired,
    markRepoNotifications: PropTypes.func.isRequired,
  };

  openBrowser() {
    const url = this.props.repo.first().getIn(['repository', 'html_url']);
    shell.openExternal(url);
  }

  markRepoAsRead() {
    const { hostname, repo } = this.props;
    const repoSlug = repo.first().getIn(['repository', 'full_name']);
    this.props.markRepoNotifications(repoSlug, hostname);
  }

  render() {
    const { hostname, repo } = this.props;
    const avatarUrl = repo.first().getIn(['repository', 'owner', 'avatar_url']);

    return (
      <div>
        <div className="repository d-flex px-3 py-2 justify-content-between">
          <div className="info pr-3">
            <img className="avatar img-fluid mr-2" src={avatarUrl} />
            <span onClick={() => this.openBrowser()}>
              {this.props.repoName}
            </span>
          </div>

          <span
            title="Mark Repository as Read"
            onClick={() => this.markRepoAsRead()}
          >
            <Octicon icon={check} />
          </span>
        </div>

        <ReactCSSTransitionGroup
          transitionName="notification"
          transitionEnter={false}
          transitionLeaveTimeout={325}
        >
          {repo.map(obj =>
            <SingleNotification
              key={obj.get('id')}
              hostname={hostname}
              notification={obj}
            />
          )}
        </ReactCSSTransitionGroup>

      </div>
    );
  }
}

export default connect(null, { markRepoNotifications })(
  RepositoryNotifications
);
