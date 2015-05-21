var React = require('react');
var Reflux = require('Reflux');

var AuthStore = require('../stores/auth');
var Actions = require('../actions/actions');

var Navigation = React.createClass({
  mixins: [
    Reflux.connect(AuthStore, 'authStatus'),
    Reflux.listenTo(Actions.getNotifications.completed, 'refreshDone'),
    Reflux.listenTo(Actions.getNotifications.failed, 'refreshDone')
  ],

  contextTypes: {
    router: React.PropTypes.func
  },

  getInitialState: function () {
    return {
      authStatus: AuthStore.authStatus(),
      loading: false
    };
  },

  reloadRepos: function () {
    console.log("Will reload repos at some point...");
  },

  refreshDone: function (argument) {
    console.log("Refresh Done!");
  },

  logOut: function () {
    Actions.logout();
    this.context.router.transitionTo('login');
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
