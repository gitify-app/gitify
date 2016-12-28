import React from 'react';
import { connect } from 'react-redux';

const ipcRenderer = window.require('electron').ipcRenderer;
const shell = window.require('electron').shell;

import { fetchNotifications, logout, toggleSettingsModal } from '../actions';
import Constants from '../utils/constants';

export class Sidebar extends React.Component {
  componentDidMount() {
    const self = this;
    const iFrequency = 60000;

    this.requestInterval = setInterval(() => {
      self.refreshNotifications();
    }, iFrequency);
  }

  componentWillUnmount() {
    clearInterval(this.requestInterval);
  }

  refreshNotifications() {
    if (this.props.isLoggedIn) {
      this.props.fetchNotifications();
    }
  }

  appQuit() {
    ipcRenderer.send('app-quit');
  }

  openBrowser() {
    shell.openExternal(`http://www.github.com/${Constants.REPO_SLUG}`);
  }

  render() {
    const { hasStarred, isLoggedIn, notifications } = this.props;

    return (
      <div className="sidebar-wrapper bg-inverse">
        <img
          className="img-fluid logo"
          src="images/gitify-logo-outline-light.png"
          onClick={this.openBrowser} />

        <div className="tag tag-count text-success text-uppercase">
          {notifications.isEmpty() ? 'All Read' : `${notifications.size} Unread`}
        </div>

        {isLoggedIn && (
          <ul className="nav nav-inline">
            <li className="nav-item text-white">
              <i
                title="Refresh"
                className="nav-link fa fa-refresh"
                onClick={() => this.refreshNotifications()} />
            </li>

            <li className="nav-item text-white">
              <i
                title="Settings"
                className="nav-link fa fa-cog"
                onClick={() => this.props.toggleSettingsModal()} />
            </li>
          </ul>
        )}

        <div className="footer">
          {!hasStarred && (
            <button className="btn btn-block btn-sm btn-outline-secondary btn-star" onClick={this.openBrowser}>
              <i className="fa fa-github" /> Star
            </button>
          )}
        </div>
      </div>
    );
  }
};

function mapStateToProps(state) {
  return {
    hasStarred: state.settings.get('hasStarred'),
    notifications: state.notifications.get('response'),
    isLoggedIn: state.auth.get('token') !== null
  };
};

export default connect(mapStateToProps, { fetchNotifications, logout, toggleSettingsModal })(Sidebar);
