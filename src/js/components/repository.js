var React = require('react');
var SingleNotification = require('../components/notification');
var _ = require('underscore');

var Repository = React.createClass({

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
        <h3>{this.props.repoName}</h3>
        {notifications}
      </div>
    );
  }
});

module.exports = Repository;
