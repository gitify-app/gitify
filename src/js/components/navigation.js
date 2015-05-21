var React = require('react');
var Reflux = require('Reflux');

var Navigation = React.createClass({

  getInitialState: function () {
    return {
      // tokens: AuthStore.authStatus()
    };
  },

  render: function () {
    var refreshIcon, logoutIcon;
    var loadingClass = this.state.loading ? 'fa fa-refresh fa-spin' : 'fa fa-refresh';

    if (this.state.authStatus) {
      refreshIcon = (
        <i className={loadingClass} onClick={this.reloadRepos} />
      );
      logoutIcon = (
        <i className='fa fa-sign-out' onClick={this.logOut} />
      );
    }

    return (
      <div className='container-fluid'>
        <div className='row navigation'>
          <div className='col-xs-4 left'>{refreshIcon}</div>
          <div className='col-xs-4 logo'>GitHub</div>
          <div className='col-xs-4 right'>{logoutIcon}</div>
        </div>
      </div>
    );
  }
});

module.exports = Navigation;
