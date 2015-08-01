var React = require('react');
var remote = window.require('remote');
var shell = remote.require('shell');

var SingleNotification = require('../components/notification');
var Actions = require('../actions/actions');
var apiRequests = require('../utils/api-requests');

var Repository = React.createClass({

  getInitialState: function () {
    return {
      isRead: false,
      errors: false
    };
  },

  getAvatar: function () {
    return this.props.repo[0].repository.owner.avatar_url;
  },

  openBrowser: function () {
    var url = this.props.repo[0].repository.html_url;
    shell.openExternal(url);
  },

  markRepoAsRead: function () {
    var self = this;
    var loginId = this.props.repo[0].repository.owner.login;
    var repoId = this.props.repo[0].repository.name;
    var fullName = this.props.repo[0].repository.full_name;

    apiRequests
      .putAuth('https://api.github.com/repos/' + loginId + '/' + repoId + '/notifications', {})
      .end(function (err, response) {
        if (response && response.ok) {
          // Notification Read
          self.setState({
            isRead: true,
            errors: false
          });

          Actions.removeRepoNotifications(fullName);
        } else {
          self.setState({
            isRead: false,
            errors: true
          });
        }
      });

  },

  render: function () {
    var self = this;
    var organisationName, repositoryName;

    if (typeof this.props.repoName === 'string') {
      var splitName = this.props.repoName.split('/');
      organisationName = splitName[0];
      repositoryName = splitName[1];
    }

    return (
      <div>
        <div className={this.state.isRead ? 'row repository read' : 'row repository'}>
          <div className='col-xs-2'><img className='avatar' src={this.getAvatar()} /></div>
          <div className='col-xs-9 name' onClick={this.openBrowser}>
            <span>{'/' + repositoryName}</span>
            <span>{organisationName}</span>
          </div>
          <div className='col-xs-1 check-wrapper'>
            <span className='octicon octicon-check' onClick={this.markRepoAsRead} />
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
});

module.exports = Repository;
