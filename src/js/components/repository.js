var React = require('react');
var remote = window.require('remote');
var shell = remote.require('shell');

var SingleNotification = require('../components/notification');

var Repository = React.createClass({

  getAvatar: function () {
    return this.props.repo[0].repository.owner.avatar_url;
  },

  openBrowser: function () {
    var url = this.props.repo[0].repository.html_url;
    shell.openExternal(url);
  },

  render: function () {
    return (
      <div>
        <div className='row repository'>
          <div className='col-xs-2'><img className='avatar' src={this.getAvatar()} /></div>
          <div className='col-xs-10 name' onClick={this.openBrowser}>{this.props.repoName}</div>
        </div>

        {this.props.repo.map(function (obj) {
          return <SingleNotification notification={obj} key={obj.id} />;
        })}

      </div>
    );
  }
});

module.exports = Repository;
