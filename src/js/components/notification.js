const { shell } = require('electron');

import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import { markNotification } from '../actions';
import Helpers from '../utils/helpers';


export class SingleNotification extends React.Component {
  pressTitle() {
    this.openBrowser();

    if (this.props.markOnClick) {
      this.markAsRead();
    }
  }

  openBrowser() {
    var url = Helpers.generateGitHubUrl(this.props.isEnterprise, this.props.notification.getIn(['subject', 'url']));
    shell.openExternal(url);
  }

  markAsRead() {
    this.props.markNotification(this.props.notification.get('id'));
  }

  render() {
    let typeIconClass, typeIconTooltip;

    const updated = moment(this.props.notification.get('updated_at'));
    const timeSinceUpdated = updated.fromNow();
    const reason = this.props.notification.get('reason');
    const type = this.props.notification.getIn(['subject', 'type']);

    if (type === 'Issue') {
      typeIconClass = 'octicon octicon-issue-opened';
      typeIconTooltip = 'Issue';
    } else if (type === 'PullRequest') {
      typeIconClass = 'octicon octicon-git-pull-request';
      typeIconTooltip = 'Pull Request';
    } else if (type === 'Commit') {
      typeIconClass = 'octicon octicon-git-commit';
      typeIconTooltip = 'Commit';
    } else if (type === 'Release') {
      typeIconClass = 'octicon octicon-tag';
      typeIconTooltip = 'Release';
    } else {
      typeIconClass = 'octicon octicon-question';
      typeIconTooltip = '';
    }

    return (
      <div className="row notification">
        <div className="col-xs-1"><span title={typeIconTooltip} className={typeIconClass} /></div>
        <div className="col-xs-10 subject" onClick={() => this.pressTitle()}>
          <h6>{this.props.notification.getIn(['subject', 'title'])}</h6>

          <div className="details">
            <span className="text-capitalize">{reason}</span> - Updated {timeSinceUpdated}
          </div>
        </div>
        <div className="col-xs-1 check-wrapper">
          <span title="Mark as Read" className="octicon octicon-check" onClick={() => this.markAsRead()} />
        </div>
      </div>
    );
  }
};

export function mapStateToProps(state) {
  return {
    markOnClick: state.settings.get('markOnClick'),
    isEnterprise: state.settings.get('isEnterprise')
  };
};

export default connect(mapStateToProps, { markNotification })(SingleNotification);
