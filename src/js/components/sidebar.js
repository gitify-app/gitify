import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { List, Map } from 'immutable';
import { shell } from 'electron';

import { fetchNotifications, logout, toggleSettingsModal } from '../actions';
import { isUserEitherLoggedIn } from '../utils/helpers';
import Logo from './logo';
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

  componentWillReceiveProps(nextProps) {
    if (nextProps.connectedAccounts > this.props.connectedAccounts) {
      this.props.fetchNotifications();
    }
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
    const notificationsCount = this.props.notifications
      .find(obj => obj.get('hostname') === defaultHostname, null, Map())
      .get('notifications', List()).size;

    return (
      <div className="badge-account" title={defaultHostname}>
        <div className="mr-auto name">GitHub</div>
        <div>{notificationsCount === 0 ? <span className="octicon octicon-check" /> : notificationsCount}</div>
      </div>
    );
  }

  _renderEnterpriseAccounts() {
    return this.props.enterpriseAccounts.map((account, idx) => {
      const splittedHostname = account.get('hostname').split('.');
      const accountDomain = splittedHostname[splittedHostname.length - 2];
      const notificationsCount = this.props.notifications
        .find(obj => obj.get('hostname') === account.get('hostname'), null, Map())
        .get('notifications', List()).size;

      return (
        <div
          key={idx}
          title={account.get('hostname')}
          className="badge-account"
          >
          <div className="mr-auto name">{accountDomain}</div>
          <div>{notificationsCount === 0 ? <span className="octicon octicon-check" /> : notificationsCount}</div>
        </div>
      );
    });
  }

  render() {
    const { hasStarred, isEitherLoggedIn, isGitHubLoggedIn, notifications } = this.props;
    const notificationsCount = notifications.reduce((memo, acc) => memo + acc.get('notifications').size, 0);

    return (
      <div className="sidebar-wrapper">
        <Logo onClick={this.openBrowser} />

        {isEitherLoggedIn && (
          <div className="badge badge-count text-success my-1">
            {notifications.isEmpty() ? 'All Read' : `${notificationsCount} Unread`}
          </div>
        )}

        {isEitherLoggedIn && (
          <ul className="nav nav-inline mb-2">
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
          {!!isEitherLoggedIn &&
            <Link
              to="/enterpriselogin"
              className="btn btn-block btn-sm btn-outline-secondary btn-add">Add <br />Enterprise</Link>
          }

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
  const enterpriseAccounts = state.auth.get('enterpriseAccounts');
  const isGitHubLoggedIn = state.auth.get('token') !== null;
  const connectedAccounts = enterpriseAccounts.reduce((memo, acc) => memo + 1, isGitHubLoggedIn ? 1 : 0);

  return {
    isGitHubLoggedIn,
    isEitherLoggedIn: isUserEitherLoggedIn(state.auth),
    notifications: state.notifications.get('response'),
    enterpriseAccounts,
    connectedAccounts,
    hasStarred: state.settings.get('hasStarred'),
  };
};

export default connect(mapStateToProps, { fetchNotifications, logout, toggleSettingsModal })(Sidebar);
