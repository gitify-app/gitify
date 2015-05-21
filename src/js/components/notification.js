var React = require('react');
var remote = window.require('remote');
var shell = remote.require('shell');
var _ = require('underscore');

var AuthStore = require('../stores/auth');

var Notification = React.createClass({

  openBrowser: function () {
    shell.openExternal(url + this.props.notificationsubject.url);
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
      <div className='row notification' onClick={this.openBrowser}>
        <span className={typeIconClass} /> {this.props.notification.subject.title}
      </div>
    );
  }
});

module.exports = Notification;
