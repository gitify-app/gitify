const { shell } = require('electron');

import * as React from 'react';
import * as moment from 'moment';
import { connect } from 'react-redux';

import Octicon, {
  Check,
  IssueOpened,
  GitPullRequest,
  GitCommit,
  Tag,
  Question,
} from '@primer/octicons-react';

import { generateGitHubWebUrl } from '../utils/helpers';
import { markNotification } from '../actions';
import { Notification } from '../../types/github';

interface IProps {
  hostname: string;
  notification: Notification;
  markOnClick: boolean;
  markNotification: (id: string, hostname: string) => void;
}

export class NotificationItem extends React.Component<IProps, {}> {
  pressTitle() {
    this.openBrowser();

    if (this.props.markOnClick) {
      this.markAsRead();
    }
  }

  openBrowser() {
    const url = generateGitHubWebUrl(this.props.notification.subject.url);
    shell.openExternal(url);
  }

  markAsRead() {
    const { hostname, notification } = this.props;
    this.props.markNotification(notification.id, hostname);
  }

  render() {
    let typeIcon;

    const updated = moment(this.props.notification.updated_at);
    const timeSinceUpdated = updated.fromNow();
    const reason = this.props.notification.reason;
    const type = this.props.notification.subject.type;

    if (type === 'Issue') {
      typeIcon = IssueOpened;
    } else if (type === 'PullRequest') {
      typeIcon = GitPullRequest;
    } else if (type === 'Commit') {
      typeIcon = GitCommit;
    } else if (type === 'Release') {
      typeIcon = Tag;
    } else {
      typeIcon = Question;
    }

    return (
      <div className="row notification no-gutters px-3 py-2">
        <div className="col-1">
          <Octicon icon={typeIcon} />
        </div>
        <div className="col-10 subject" onClick={() => this.pressTitle()}>
          <h6>{this.props.notification.subject.title}</h6>

          <div className="details">
            <span className="text-capitalize">{reason}</span> - Updated{' '}
            {timeSinceUpdated}
          </div>
        </div>
        <div className="col-1 check-wrapper">
          <button
            className="btn btn-link py-0 octicon octicon-check"
            title="Mark as Read"
            onClick={() => this.markAsRead()}
          >
            <Octicon icon={Check} />
          </button>
        </div>
      </div>
    );
  }
}

export function mapStateToProps(state) {
  return {
    markOnClick: state.settings.get('markOnClick'),
  };
}

export default connect(mapStateToProps, { markNotification })(NotificationItem);
