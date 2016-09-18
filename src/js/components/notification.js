const shell = window.require('electron').shell;

import React from 'react';
import { connect } from 'react-redux';

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
    var url = Helpers.generateGitHubUrl(this.props.notification.getIn(['subject', 'url']));
    shell.openExternal(url);
  }

  markAsRead() {
    this.props.markNotification(this.props.notification.get('id'));
  }

  render() {
    var typeIconClass, typeIconTooltip;
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
        <div className="col-xs-10 subject" onClick={this.pressTitle.bind(this)}>
          {this.props.notification.getIn(['subject', 'title'])}
        </div>
        <div className="col-xs-1 check-wrapper">
          <span title="Mark as Read" className="octicon octicon-check" onClick={() => this.markAsRead()} />
        </div>
      </div>
    );
  }
};

function mapStateToProps(state) {
  return {
    markOnClick: state.settings.markOnClick
  };
};

export default connect(mapStateToProps, { markNotification })(SingleNotification);
