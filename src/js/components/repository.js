var React = require('react');
var SingleNotification = require('../components/notification');
var _ = require('underscore');

var Repository = React.createClass({

  getAvatar: function () {
    return this.props.repo[0].repository.owner.avatar_url;
  },

  render: function () {
    var notifications = (
      _.map(this.props.repo, function(notification, i) {
        return (
          <SingleNotification notification={notification} key={i} />
        );
      })
    );

    return (
      <div>
        <div className='row repository'>
          <div className='col-xs-2'><img className='avatar' src={this.getAvatar()} /></div>
          <div className='col-xs-10 name'>{this.props.repoName}</div>
        </div>
        {notifications}
      </div>
    );
  }
});

module.exports = Repository;
