var React = require('react');
var Reflux = require('reflux');
var Router = require('react-router');

var ipc = window.require('ipc');

var Actions = require('../actions/actions');
var AuthStore = require('../stores/auth');

var Navigation = React.createClass({
  mixins: [
    Router.State,
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

  componentDidMount: function () {
    var self = this;
    var iFrequency = 60000;
    var myInterval = 0;
    if (myInterval > 0) { clearInterval(myInterval); }
    setInterval( function () {
      self.refreshNotifications();
    }, iFrequency );
  },

  refreshNotifications: function () {
    this.setState( {loading: true } );
    Actions.getNotifications();
  },

  refreshDone: function () {
    this.setState( {loading: false } );
  },

  goToSettings: function () {
    this.context.router.transitionTo('settings');
  },

  logOut: function () {
    Actions.logout();
    this.context.router.transitionTo('login');
    ipc.sendChannel('update-icon', 'IconPlain');
  },

  goBack: function () {
    this.context.router.transitionTo('notifications');
  },

  appQuit: function () {
    ipc.sendChannel('app-quit');
  },

  render: function () {
    var refreshIcon, logoutIcon, backIcon, settingsIcon, quitIcon;
    var loadingClass = this.state.loading ? 'fa fa-refresh fa-spin' : 'fa fa-refresh';

    if (this.state.authStatus) {
      refreshIcon = (
        <i className={loadingClass} onClick={this.refreshNotifications} />
      );
      logoutIcon = (
        <i className='fa fa-sign-out' onClick={this.logOut} />
      );
      settingsIcon = (
        <i className='fa fa-cog' onClick={this.goToSettings} />
      );
    } else {
      quitIcon = (
        <i className='fa fa-power-off' onClick={this.appQuit} />
      );
    }
    if (this.getPath() === '/settings') {
      backIcon = (
        <i className='fa fa-chevron-left' onClick={this.goBack} />
      );
      settingsIcon = (
        <i className='fa fa-cog' onClick={this.goBack} />
      );
    }

    return (
      <div className='container-fluid'>
        <div className='row navigation'>
          <div className='col-xs-4 left'>
            {backIcon}
            {refreshIcon}
          </div>
          <div className='col-xs-4 logo'>
            <img className='img-responsive' src='images/logo-hor-white.png' />
          </div>
          <div className='col-xs-4 right'>
            {settingsIcon}
            {logoutIcon}
            {quitIcon}
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Navigation;
