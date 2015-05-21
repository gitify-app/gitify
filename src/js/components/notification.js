var React = require('react');
var remote = window.require('remote');
var shell = remote.require('shell');
var _ = require('underscore');

var AuthStore = require('../stores/auth');
var apiRequests = require('../utils/api-requests');

var Notification = React.createClass({

  openBrowser: function () {
    shell.openExternal(url + this.props.notification.subject.url);
  },

  markAsRead: function () {
    apiRequests
      .patchAuth('https://api.github.com/notifications/threads/' + this.props.notification.id)
      .end(function (err, response) {
        if (response && response.ok) {
          // Notification Read
          // Remove from list?
        } else {
          // Error - Show messages.
          console.log(err);
        }
      });
  },

  render: function () {
    var typeIconClass;

    if (this.props.notification.subject.type == "Issue") {
      typeIconClass = "octicon octicon-issue-opened";
    } else if (this.props.notification.subject.type == "PullRequest") {
      typeIconClass = "octicon octicon-git-pull-request";
    } else {
      typeIconClass = "octicon octicon-question";
    }

    return (
      <div className='row notification'>
        <span className={typeIconClass} />
        <span onClick={this.openBrowser}>{this.props.notification.subject.title}</span>
        <span className="octicon octicon-check" onClick={this.markAsRead}></span>
      </div>
    );
  }
});

module.exports = Notification;
