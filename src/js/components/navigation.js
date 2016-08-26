import React from 'react';
import { connect } from 'react-redux';

const ipcRenderer = window.require('electron').ipcRenderer;
const shell = window.require('electron').shell;

import { fetchNotifications, logout } from '../actions';

export class Navigation extends React.Component {
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
    const isLoggedIn = this.props.token !== null;
    if (isLoggedIn) {
      this.props.fetchNotifications();
    }
  }

  goToSettings() {
    if (this.props.showSearch) {
      this.props.toggleSearch();
    }

    this.context.router.push('/settings');
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
    const loadingClass = this.props.isFetching ? ' logo-spin' : '';
    var refreshIcon, backIcon, settingsIcon, quitIcon, searchIcon, countLabel;

    if (isLoggedIn) {
      refreshIcon = (
        <li className="nav-item">
          <i title="Refresh" className={'nav-link fa fa-refresh'} onClick={this.refreshNotifications.bind(this)} />
        </li>
      );
      settingsIcon = (
        <li className="nav-item">
          <i title="Settings" className="nav-link fa fa-cog" onClick={this.goToSettings.bind(this)} />
        </li>
      );
      if (this.props.notifications.length) {
        searchIcon = (
          <li className="nav-item">
            <i title="Search" className="nav-link fa fa-search" onClick={this.props.toggleSearch} />
          </li>
        );
        countLabel = (
          <span className="tag tag-success">{this.props.notifications.length}</span>
        );
      }
    } else {
      quitIcon = (
        <li className="nav-item">
          <i title="Quit" className="nav-link fa fa-power-off" onClick={this.appQuit.bind(this)} />
        </li>
      );
    }

    if (this.props.location.pathname === '/settings') {
      backIcon = (
        <li className="nav-item">
          <i title="Back" className="nav-link fa fa-chevron-left" onClick={this.goBack.bind(this)} />
        </li>
      );
      settingsIcon = (
        <li className="nav-item">
          <i title="Settings" className="nav-link fa fa-cog" onClick={this.goBack.bind(this)} />
        </li>
      );
    }

    return (
      <nav className="navbar navbar-dark bg-inverse">
        <img
          className={'navbar-brand img-responsive' + loadingClass}
          src="images/gitify-logo-fill-light-small.png"
          onClick={this.openBrowser} />
        {countLabel}

        <ul className="nav navbar-nav pull-xs-right">
          {backIcon}
          {searchIcon}
          {refreshIcon}
          {settingsIcon}
          {quitIcon}
        </ul>
      </nav>
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
