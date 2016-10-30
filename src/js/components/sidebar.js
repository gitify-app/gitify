import React from 'react';
import { connect } from 'react-redux';

const ipcRenderer = window.require('electron').ipcRenderer;
const shell = window.require('electron').shell;

import { fetchNotifications, logout } from '../actions';

export class Sidebar extends React.Component {
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
    this.context.router.push('/settings');
  }

  goBack() {
    this.context.router.push('/notifications');
  }

  appQuit() {
    ipcRenderer.send('app-quit');
  }

  openBrowser() {
    shell.openExternal('http://www.github.com/manosim/gitify');
  }

  render() {
    const isLoggedIn = this.props.token !== null;
    const loadingClass = this.props.isFetching ? ' logo-spin' : '';
    var refreshIcon, backIcon, settingsIcon, quitIcon, countLabel;

    if (isLoggedIn) {
      refreshIcon = (
        <li className="nav-item">
          <i title="Refresh" className={'nav-link fa fa-refresh'} onClick={() => this.refreshNotifications()} />
        </li>
      );
      settingsIcon = (
        <li className="nav-item">
          <i title="Settings" className="nav-link fa fa-cog" onClick={() => this.goToSettings()} />
        </li>
      );
      if (!this.props.notifications.isEmpty()) {
        countLabel = (
          <span className="tag tag-success">{this.props.notifications.size}</span>
        );
      }
    } else {
      quitIcon = (
        <li className="nav-item">
          <i title="Quit" className="nav-link fa fa-power-off" onClick={() => this.appQuit()} />
        </li>
      );
    }

    if (this.props.location.pathname === '/settings') {
      backIcon = (
        <li className="nav-item">
          <i title="Back" className="nav-link fa fa-chevron-left" onClick={() => this.goBack()} />
        </li>
      );
      settingsIcon = (
        <li className="nav-item">
          <i title="Settings" className="nav-link fa fa-cog" onClick={() => this.goBack()} />
        </li>
      );
    }

    return (
      <div className="sidebar-wrapper bg-inverse">
        <img
          className={'navbar-brand img-responsive' + loadingClass}
          src="images/gitify-logo-fill-light-small.png"
          onClick={this.openBrowser} />
        {countLabel}

        <ul className="nav navbar-nav pull-xs-right">
          {backIcon}
          {refreshIcon}
          {settingsIcon}
          {quitIcon}
        </ul>
      </div>
    );
  }
};

Sidebar.contextTypes = {
  location: React.PropTypes.object,
  router: React.PropTypes.object.isRequired
};

function mapStateToProps(state) {
  return {
    isFetching: state.notifications.get('isFetching'),
    notifications: state.notifications.get('response'),
    token: state.auth.get('token')
  };
};

export default connect(mapStateToProps, { fetchNotifications, logout })(Sidebar);
