var React = require('react');
var remote = window.require('remote');
var shell = remote.require('shell');

var SingleNotification = require('../components/notification');
var apiRequests = require('../utils/api-requests');

var Repository = React.createClass({

  getAvatar: function () {
    return this.props.repo[0].repository.owner.avatar_url;
  },

  openBrowser: function () {
    var url = this.props.repo[0].repository.html_url;
    shell.openExternal(url);
  },

  markRepoAsRead: function () {
    // var self = this;
    var loginId = this.props.repo[0].repository.owner.login;
    var repoId = this.props.repo[0].repository.name;

    // /repos/:owner/:repo/notifications
    console.log('https://api.github.com/repos/' + loginId + '/' + repoId + '/notifications');
    apiRequests
      .putAuth('https://api.github.com/repos/' + loginId + '/' + repoId + '/notifications', {})
      .end(function (err, response) {
        if (response && response.ok) {
          // Notification Read
          console.log("SUCCESS!");
        } else {
          // Error - Show messages.
          // Show appropriate message
        }
      });

  },

  render: function () {
    var organisationName, repositoryName;

    if (typeof this.props.repoName === 'string') {
      var splitName = this.props.repoName.split('/');
      organisationName = splitName[0];
      repositoryName = splitName[1];
    }

    return (
      <div>
        <div className='row repository'>
          <div className='col-xs-2'><img className='avatar' src={this.getAvatar()} /></div>
          <div className='col-xs-9 name' onClick={this.openBrowser}>
            <span>{'/' + repositoryName}</span>
            <span>{organisationName}</span>
          </div>
          <div className='col-xs-1 check-wrapper'>
            <span className='octicon octicon-check' onClick={this.markRepoAsRead} />
          </div>
        </div>

        {this.props.repo.map(function (obj) {
          return <SingleNotification notification={obj} key={obj.id} />;
        })}

      </div>
    );
  }
});

module.exports = Repository;
