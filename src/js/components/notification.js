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

    return (
      <div className='row notification' onClick={this.openBrowser}>
        <div className='subject'>{this.props.notification.subject.title}</div>
      </div>
    );
  }
});

module.exports = Notification;
