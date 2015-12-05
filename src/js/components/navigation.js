var electron = window.require('electron');
var remote = electron.remote;
var ipc = remote.ipcRenderer;
var shell = remote.shell;

var React = require('react');
var Reflux = require('reflux');
var ReactRouter = require('react-router');
var Router = ReactRouter.Router;

var Actions = require('../actions/actions');
var AuthStore = require('../stores/auth');
var NotificationsStore = require('../stores/notifications.js');

var Navigation = React.createClass({
  mixins: [
    Reflux.connect(AuthStore, 'authStatus'),
    Reflux.connect(NotificationsStore, 'notifications'),
    Reflux.listenTo(Actions.getNotifications.completed, 'refreshDone'),
    Reflux.listenTo(Actions.getNotifications.failed, 'refreshDone')
  ],

  // contextTypes: {
  //   router: React.PropTypes.func
  // },

  contextTypes: {
    location: React.PropTypes.object
  },

  getInitialState: function () {
    return {
      authStatus: AuthStore.authStatus(),
      loading: false,
      notifications: []
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
    this.setState({
      loading: false
    });
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

  showSearch: function () {
    this.props.toggleSearch();
  },

  appQuit: function () {
    ipc.sendChannel('app-quit');
  },

  openBrowser: function () {
    shell.openExternal('http://www.github.com/ekonstantinidis/gitify');
  },

  render: function () {
    var refreshIcon, logoutIcon, backIcon, settingsIcon, quitIcon, searchIcon, countLabel;
    var loadingClass = this.state.loading ? 'fa fa-refresh fa-spin' : 'fa fa-refresh';

    if (this.state.authStatus) {
      refreshIcon = (
        <i title="Refresh" className={loadingClass} onClick={this.refreshNotifications} />
      );
      logoutIcon = (
        <i title="Sign Out" className='fa fa-sign-out' onClick={this.logOut} />
      );
      settingsIcon = (
        <i title="Settings" className='fa fa-cog' onClick={this.goToSettings} />
      );
      if (this.state.notifications.length) {
        searchIcon = (
          <i title="Search" className='fa fa-search' onClick={this.showSearch} />
        );
        countLabel = (
          <span className='label label-success'>{this.state.notifications.length}</span>
        );
      }
    } else {
      quitIcon = (
        <i title="Quit" className='fa fa-power-off' onClick={this.appQuit} />
      );
    }

    console.log('=============');
    console.log('=============');
    console.log(JSON.stringify(this.props.location));
    console.log(JSON.stringify(this.context.location));
    console.log(JSON.stringify(this.props.history));
    console.log('=============');
    console.log('=============');

    // if (this.getPath() === '/settings') {
    //   backIcon = (
    //     <i title="Back" className='fa fa-chevron-left' onClick={this.goBack} />
    //   );
    //   settingsIcon = (
    //     <i title="Settings" className='fa fa-cog' onClick={this.goBack} />
    //   );
    // }

    return (
      <div className='container-fluid'>
        <div className='row navigation'>
          <div className='col-xs-6 left'>
            <img
              className='img-responsive logo'
              src='images/logo-hor-white.png'
              onClick={this.openBrowser}/>
            {countLabel}
            {refreshIcon}
          </div>
          <div className='col-xs-6 right'>
            {backIcon}
            {searchIcon}
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
