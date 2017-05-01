import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Map, List } from 'immutable';
import { shell } from 'electron';

import { fetchNotifications, logout, toggleSettingsModal } from '../actions';
import { isUserEitherLoggedIn } from '../utils/helpers';
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
    if (this.props.isEitherLoggedIn) {
      this.props.fetchNotifications();
    }
  }

  openBrowser() {
    shell.openExternal(`https://www.github.com/${Constants.REPO_SLUG}`);
  }

  _renderGitHubAccount() {
    const defaultHostname = Constants.DEFAULT_AUTH_OPTIONS.hostname;
    const accNot = this.props.notifications.find(obj => obj.get('hostname') === defaultHostname);
    const notificationsCount = accNot ? accNot.get('notifications', List()).size : 0;

    return (
      <div className="badge badge-primary text-uppercase" title={defaultHostname}>
        {defaultHostname.split('.')[0]} {notificationsCount}
      </div>
    );
  }

  _renderEnterpriseAccounts() {
    return this.props.enterpriseAccounts.map((account, idx) => {
      const accNot = this.props.notifications.find(obj => obj.get('hostname') === account.get('hostname'));
      const splittedHostname = account.get('hostname').split('.');
      const accountDomain = splittedHostname[splittedHostname.length - 2];
      const notificationsCount = accNot ? accNot.get('notifications', List()).size : 0;

      return (
        <div className="badge badge-primary text-uppercase" key={idx} title={account.get('hostname')}>
          {accountDomain} {notificationsCount}
        </div>
      );
    });
  }

  render() {
    const { hasStarred, isEitherLoggedIn, isGitHubLoggedIn, notifications } = this.props;
    const notificationsCount = notifications.reduce((memo, acc) => memo + acc.get('notifications').size, 0);

    return (
      <div className="sidebar-wrapper bg-inverse">
        <img
          className="img-fluid logo"
          src="images/gitify-logo-outline-light.png"
          onClick={this.openBrowser} />

        {isEitherLoggedIn && (
          <div className="badge badge-count text-success text-uppercase">
            {notifications.isEmpty() ? 'All Read' : `${notificationsCount} Unread`}
          </div>
        )}

        {isEitherLoggedIn && (
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

        {isGitHubLoggedIn && this._renderGitHubAccount()}
        {this._renderEnterpriseAccounts()}

        <div className="footer">
          {!!isEitherLoggedIn && <Link to="/enterpriselogin" className="btn btn-block">Add</Link>}

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

export function mapStateToProps(state) {
  return {
    hasStarred: state.settings.get('hasStarred'),
    notifications: state.notifications.get('response'),
    isGitHubLoggedIn: state.auth.get('token') !== null,
    isEitherLoggedIn: isUserEitherLoggedIn(state.auth),
    enterpriseAccounts: state.auth.get('enterpriseAccounts'),
  };
};

export default connect(mapStateToProps, { fetchNotifications, logout, toggleSettingsModal })(Sidebar);
