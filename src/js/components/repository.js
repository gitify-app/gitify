import React from 'react';
import { connect } from 'react-redux';
const shell = window.require('electron').shell;

import { markRepoNotifications } from '../actions';
import SingleNotification from './notification';

class Repository extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isRead: false,
      errors: false
    };
  }

  openBrowser() {
    var url = this.props.repo[0].repository.html_url;
    shell.openExternal(url);
  }

  markRepoAsRead() {
    const loginId = this.props.repo[0].repository.owner.login;
    const repoId = this.props.repo[0].repository.name;
    // const fullName = this.props.repo[0].repository.full_name;

    this.props.markRepoNotifications(loginId, repoId);

    // Actions.removeRepoNotifications(fullName);
  }

  render() {
    var self = this;
    var organisationName, repositoryName;
    const avatarUrl = this.props.repo[0].repository.owner.avatar_url;

    if (typeof this.props.repoName === 'string') {
      var splitName = this.props.repoName.split('/');
      organisationName = splitName[0];
      repositoryName = splitName[1];
    }

    return (
      <div>
        <div className="row repository">
          <div className="col-xs-2"><img className="avatar" src={avatarUrl} /></div>
          <div className="col-xs-9 name" onClick={this.openBrowser.bind(this)}>
            <span>{'/' + repositoryName}</span>
            <span>{organisationName}</span>
          </div>
          <div className="col-xs-1 check-wrapper">
            <span
              title="Mark Repository as Read"
              className="octicon octicon-check"
              onClick={this.markRepoAsRead.bind(this)} />
          </div>
        </div>

        {this.state.errors ?
          <div className="alert alert-danger">
            <strong>Oops!</strong> We couldn't mark this repo as read.
          </div> : null
        }

        {this.props.repo.map(function (obj) {
          return <SingleNotification isRead={self.state.isRead} notification={obj} key={obj.id} />;
        })}

      </div>
    );
  }
};

export default connect(null, { markRepoNotifications })(Repository);
