const { shell } = require('electron');

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import Octicon, {
  check,
  issueOpened,
  gitPullRequest,
  gitCommit,
  tag,
  question,
} from 'octicons-react';

import { markNotification } from '../actions';
import { generateGitHubWebUrl } from '../utils/helpers';

export class SingleNotification extends React.Component {
  static propTypes = {
    hostname: PropTypes.string.isRequired,
    notification: PropTypes.object.isRequired,
    markOnClick: PropTypes.bool,
    markNotification: PropTypes.func.isRequired,
  };

  pressTitle() {
    this.openBrowser();

    if (this.props.markOnClick) {
      this.markAsRead();
    }
  }

  openBrowser() {
    const url = generateGitHubWebUrl(
      this.props.notification.getIn(['subject', 'url'])
    );
    shell.openExternal(url);
  }

  markAsRead() {
    const { hostname, notification } = this.props;
    this.props.markNotification(notification.get('id'), hostname);
  }

  render() {
    let typeIconClass, typeIconTooltip;

    const updated = moment(this.props.notification.get('updated_at'));
    const timeSinceUpdated = updated.fromNow();
    const reason = this.props.notification.get('reason');
    const type = this.props.notification.getIn(['subject', 'type']);

    if (type === 'Issue') {
      typeIconClass = issueOpened;
      typeIconTooltip = 'Issue';
    } else if (type === 'PullRequest') {
      typeIconClass = gitPullRequest;
      typeIconTooltip = 'Pull Request';
    } else if (type === 'Commit') {
      typeIconClass = gitCommit;
      typeIconTooltip = 'Commit';
    } else if (type === 'Release') {
      typeIconClass = tag;
      typeIconTooltip = 'Release';
    } else {
      typeIconClass = question;
      typeIconTooltip = 'unknown';
    }

    return (
      <div className="row notification no-gutters px-3 py-2">
        <div className="col-1" title={typeIconTooltip}>
          <Octicon icon={typeIconClass} scale={1.2} />
        </div>
        <div className="col-10 subject" onClick={() => this.pressTitle()}>
          <h6>{this.props.notification.getIn(['subject', 'title'])}</h6>

          <div className="details">
            <span className="text-capitalize">{reason}</span> - Updated{' '}
            {timeSinceUpdated}
          </div>
        </div>
        <div className="col-1 check-wrapper">
          <span
            title="Mark as Read"
            className="icon-check"
            onClick={() => this.markAsRead()}
          >
            <Octicon icon={check} />
          </span>
        </div>
      </div>
    );
  }
}

export function mapStateToProps(state) {
  return {
    markOnClick: state.settings.get('markOnClick'),
    isEnterprise: state.settings.get('isEnterprise'),
  };
}

export default connect(mapStateToProps, { markNotification })(
  SingleNotification
);
