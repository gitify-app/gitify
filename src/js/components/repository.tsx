const { shell } = require('electron');

import * as React from 'react';
import { CSSTransitionGroup } from 'react-transition-group';
import { connect } from 'react-redux';
import Octicon, { Check } from '@primer/octicons-react';

import { markRepoNotifications } from '../actions';
import { Notification } from '../../types/github';
import NotificationItem from './notification';

interface IProps {
  hostname: string;
  repo: [Notification];
  repoName: string;
  markRepoNotifications: (repoSlug: string, hostname: string) => void;
}

export class RepositoryNotifications extends React.Component<IProps> {
  openBrowser() {
    const url = this.props.repo[0].repository.html_url;
    shell.openExternal(url);
  }

  markRepoAsRead() {
    const { hostname, repo } = this.props;
    const repoSlug = repo[0].repository.full_name;
    this.props.markRepoNotifications(repoSlug, hostname);
  }

  render() {
    const { hostname, repo } = this.props;
    const avatarUrl = repo[0].repository.owner.avatar_url;

    return (
      <div>
        <div className="repository d-flex px-3 py-2 justify-content-between">
          <div className="info pr-3">
            <img className="avatar img-fluid mr-2" src={avatarUrl} />
            <span onClick={() => this.openBrowser()}>
              {this.props.repoName}
            </span>
          </div>

          <button
            className="btn btn-link py-0 octicon octicon-check"
            title="Mark Repository as Read"
            onClick={() => this.markRepoAsRead()}
          >
            <Octicon icon={Check} />
          </button>
        </div>

        <CSSTransitionGroup
          transitionName="notification"
          transitionEnter={false}
          transitionLeaveTimeout={325}
        >
          {repo.map(obj => (
            <NotificationItem
              key={obj.id}
              hostname={hostname}
              notification={obj}
            />
          ))}
        </CSSTransitionGroup>
      </div>
    );
  }
}

export default connect(null, { markRepoNotifications })(
  RepositoryNotifications
);
