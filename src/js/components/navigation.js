import React from 'react';
// import Reflux from 'reflux';

const ipcRenderer = window.require('electron').ipcRenderer;
const shell = window.require('electron').shell;

var Actions = {}; // FIXME!
// var AuthStore = require('../stores/auth');
// var NotificationsStore = require('../stores/notifications.js');

export default class Navigation extends React.Component {

  // FIXME!
  // mixins: [
  //   Reflux.connect(AuthStore, 'authStatus'),
  //   Reflux.connect(NotificationsStore, 'notifications'),
  //   Reflux.listenTo(Actions.getNotifications.completed, 'refreshDone'),
  //   Reflux.listenTo(Actions.getNotifications.failed, 'refreshDone')
  // ],

  constructor(props) {
    super(props);

    this.state = {
      // authStatus: AuthStore.authStatus(), FIXME!
      authStatus: false,
      loading: false,
      notifications: []
    };
  }

  componentDidMount() {
    var self = this;
    var iFrequency = 60000;
    var myInterval = 0;
    if (myInterval > 0) { clearInterval(myInterval); }
    setInterval( function () {
      self.refreshNotifications();
    }, iFrequency );
  }

  refreshNotifications() {
    this.setState( {loading: true } );
    Actions.getNotifications();
  }

  refreshDone() {
    this.setState({
      loading: false
    });
  }

  goToSettings() {

    console.log('=========');
    console.log(this.props);
    console.log('=========');


    if (this.props.showSearch) {
      this.props.toggleSearch();
    }

    this.context.router.push('/settings');
  }

  logOut() {
    if (this.props.showSearch) {
      this.props.toggleSearch();
    }

    Actions.logout();
    this.context.router.push('/login');
    ipcRenderer.send('update-icon', 'IconPlain');
  }

  goBack() {
    this.context.router.push('/notifications');
  }

  appQuit() {
    ipcRenderer.send('app-quit');
  }

  openBrowser() {
    shell.openExternal('http://www.github.com/ekonstantinidis/gitify');
  }

  render() {
    var refreshIcon, logoutIcon, backIcon, settingsIcon, quitIcon, searchIcon, countLabel;
    var loadingClass = this.state.loading ? 'fa fa-refresh fa-spin' : 'fa fa-refresh';

    if (this.state.authStatus) {
      refreshIcon = (
        <i title="Refresh" className={loadingClass} onClick={this.refreshNotifications.bind(this)} />
      );
      logoutIcon = (
        <i title="Sign Out" className="fa fa-sign-out" onClick={this.logOut.bind(this)} />
      );
      settingsIcon = (
        <i title="Settings" className="fa fa-cog" onClick={this.goToSettings.bind(this)} />
      );
      if (this.state.notifications.length) {
        searchIcon = (
          <i title="Search" className="fa fa-search" onClick={this.props.toggleSearch} />
        );
        countLabel = (
          <span className="label label-success">{this.state.notifications.length}</span>
        );
      }
    } else {
      quitIcon = (
        <i title="Quit" className="fa fa-power-off" onClick={this.appQuit.bind(this)} />
      );
    }

    if (this.props.location.pathname === '/settings') {
      backIcon = (
        <i title="Back" className="fa fa-chevron-left" onClick={this.goBack.bind(this)} />
      );
      settingsIcon = (
        <i title="Settings" className="fa fa-cog" onClick={this.goBack.bind(this)} />
      );
    }

    return (
      <div className="container-fluid">
        <div className="row navigation">
          <div className="col-xs-6 left">
            <img
              className="img-responsive logo"
              src="images/logo-hor-white.png"
              onClick={this.openBrowser}/>
            {countLabel}
            {refreshIcon}
          </div>
          <div className="col-xs-6 right">
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
};

Navigation.contextTypes = {
  location: React.PropTypes.object,
  router: React.PropTypes.object.isRequired
};
