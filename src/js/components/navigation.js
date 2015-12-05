import React from 'react';
import { History } from 'react-router';
import Reflux from 'reflux';

const ipcRenderer = window.require('electron').ipcRenderer;
const shell = window.require('electron').shell;

var Actions = require('../actions/actions');
var AuthStore = require('../stores/auth');
var NotificationsStore = require('../stores/notifications.js');

var Navigation = React.createClass({
  mixins: [
    History,
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
    this.history.pushState(null, '/settings');
  },

  logOut: function () {
    Actions.logout();
    this.history.pushState(null, '/login');
    ipcRenderer.send('update-icon', 'IconPlain');
  },

  goBack: function () {
    this.history.pushState(null, '/notifications');
  },

  showSearch: function () {
    this.props.toggleSearch();
  },

  appQuit: function () {
    ipcRenderer.send('app-quit');
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

    if (this.context.location.pathname === '/settings') {
      backIcon = (
        <i title="Back" className='fa fa-chevron-left' onClick={this.goBack} />
      );
      settingsIcon = (
        <i title="Settings" className='fa fa-cog' onClick={this.goBack} />
      );
    }

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
