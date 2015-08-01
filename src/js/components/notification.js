var React = require('react');
var remote = window.require('remote');
var shell = remote.require('shell');

var Actions = require('../actions/actions');
var apiRequests = require('../utils/api-requests');

var NotificationItem = React.createClass({

  getInitialState: function () {
    return {
      isRead: this.props.isRead
    };
  },

  componentWillReceiveProps: function (nextProps) {
    this.setState({
      isRead: nextProps.isRead
    });
  },

  openBrowser: function () {
    var url = this.props.notification.subject.url.replace('api.github.com/repos', 'www.github.com');
    if (url.indexOf('/pulls/') != -1) {
      url = url.replace('/pulls/', '/pull/');
    }
    shell.openExternal(url);
  },

  markAsRead: function () {
    var self = this;

    if (this.state.read) { return; }

    apiRequests
      .patchAuth('https://api.github.com/notifications/threads/' + this.props.notification.id)
      .end(function (err, response) {
        if (response && response.ok) {
          // Notification Read
          self.setState({
            isRead: true
          });
          Actions.removeNotification(self.props.notification);
        } else {
          // Error - Show messages.
          // Show appropriate message
          self.setState({
            isRead: false
          });
        }
      });
  },

  render: function () {
    var typeIconClass;

    if (this.props.notification.subject.type == 'Issue') {
      typeIconClass = 'octicon octicon-issue-opened';
    } else if (this.props.notification.subject.type == 'PullRequest') {
      typeIconClass = 'octicon octicon-git-pull-request';
    } else if (this.props.notification.subject.type == 'Commit') {
      typeIconClass = 'octicon octicon-git-commit';
    } else {
      typeIconClass = 'octicon octicon-question';
    }

    return (
      <div className={this.state.isRead ? 'row notification read' : 'row notification'}>
        <div className='col-xs-1'><span className={typeIconClass} /></div>
        <div className='col-xs-10 subject' onClick={this.openBrowser}>
          {this.props.notification.subject.title}
        </div>
        <div className='col-xs-1 check-wrapper'>
          <span className='octicon octicon-check' onClick={this.markAsRead} />
        </div>
      </div>
    );
  }
});

module.exports = NotificationItem;
