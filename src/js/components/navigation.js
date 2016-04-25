import React from 'react';
import { connect } from 'react-redux';

const ipcRenderer = window.require('electron').ipcRenderer;
const shell = window.require('electron').shell;

import { fetchNotifications, logout } from '../actions';

class Navigation extends React.Component {

  constructor(props) {
    super(props);

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
    this.props.fetchNotifications();
  }

  refreshDone() {
    this.setState({
      loading: false
    });
  }

  goToSettings() {
    if (this.props.showSearch) {
      this.props.toggleSearch();
    }

    this.context.router.push('/settings');
  }

  logOut() {
    if (this.props.showSearch) {
      this.props.toggleSearch();
    }

    this.props.logout();
    this.context.router.replace('/login');
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
    const isLoggedIn = this.props.token !== null;
    var refreshIcon, logoutIcon, backIcon, settingsIcon, quitIcon, searchIcon, countLabel;
    var loadingClass = this.props.isFetching ? 'fa fa-refresh fa-spin' : 'fa fa-refresh';

    if (isLoggedIn) {
      refreshIcon = (
        <i title="Refresh" className={loadingClass} onClick={this.refreshNotifications.bind(this)} />
      );
      logoutIcon = (
        <i title="Sign Out" className="fa fa-sign-out" onClick={this.logOut.bind(this)} />
      );
      settingsIcon = (
        <i title="Settings" className="fa fa-cog" onClick={this.goToSettings.bind(this)} />
      );
      if (this.props.notifications.length) {
        searchIcon = (
          <i title="Search" className="fa fa-search" onClick={this.props.toggleSearch} />
        );
        countLabel = (
          <span className="label label-success">{this.props.notifications.length}</span>
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

function mapStateToProps(state) {
  return {
    isFetching: state.notifications.isFetching,
    notifications: state.notifications.response,
    token: state.auth.token
  };
};

export default connect(mapStateToProps, { fetchNotifications, logout })(Navigation);
