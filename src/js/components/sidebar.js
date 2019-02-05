import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { List, Map } from 'immutable';
import { shell } from 'electron';
import Octicon, { markGithub, gear, sync, check } from 'octicons-react';

import { fetchNotifications, logout, toggleSettingsModal } from '../actions';
import { isUserEitherLoggedIn } from '../utils/helpers';
import LogoWhite from './logos/white';
import Constants from '../utils/constants';

export class Sidebar extends React.Component {
  static propTypes = {
    fetchNotifications: PropTypes.func.isRequired,
    connectedAccounts: PropTypes.number.isRequired,
    enterpriseAccounts: PropTypes.object.isRequired,
    notifications: PropTypes.object.isRequired,
    toggleSettingsModal: PropTypes.func.isRequired,
    hasStarred: PropTypes.bool.isRequired,
    isEitherLoggedIn: PropTypes.bool.isRequired,
    isGitHubLoggedIn: PropTypes.bool.isRequired,
  };

  componentDidMount() {
    const self = this;
    const iFrequency = 60000;

    this.requestInterval = setInterval(() => {
      self.refreshNotifications();
    }, iFrequency);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.connectedAccounts > this.props.connectedAccounts) {
      this.props.fetchNotifications();
    }
  }

  componentWillUnmount() {
    clearInterval(this.requestInterval);
  }

  refreshNotifications() {
    if (this.props.isEitherLoggedIn) {
      this.props.fetchNotifications();
    }
  }

  onOpenBrowser() {
    shell.openExternal(`https://www.github.com/${Constants.REPO_SLUG}`);
  }

  _renderGitHubAccount() {
    const { enterpriseAccounts, notifications } = this.props;
    const defaultHostname = Constants.DEFAULT_AUTH_OPTIONS.hostname;
    const notificationsCount = notifications
      .find(obj => obj.get('hostname') === defaultHostname, null, Map())
      .get('notifications', List()).size;

    return (
      <div
        className={`badge-account ${enterpriseAccounts.isEmpty() && 'last'}`}
        title={defaultHostname}
      >
        <div className="mr-auto name">GitHub</div>
        <div>
          {notificationsCount === 0
            ? <Octicon icon={check} />
            : notificationsCount}
        </div>
      </div>
    );
  }

  _renderEnterpriseAccounts() {
    const { enterpriseAccounts } = this.props;

    return this.props.enterpriseAccounts.map((account, idx) => {
      const splittedHostname = account.get('hostname').split('.');
      const accountDomain = splittedHostname[splittedHostname.length - 2];
      const notificationsCount = this.props.notifications
        .find(
          obj => obj.get('hostname') === account.get('hostname'),
          null,
          Map()
        )
        .get('notifications', List()).size;

      return (
        <div
          key={idx}
          title={account.get('hostname')}
          className={`badge-account${enterpriseAccounts.size === idx + 1
            ? ' last'
            : ''}`}
        >
          <div className="mr-auto name">{accountDomain}</div>
          <div>
            {notificationsCount === 0
              ? <Octicon icon={check} />
              : notificationsCount}
          </div>
        </div>
      );
    });
  }

  render() {
    const {
      hasStarred,
      isEitherLoggedIn,
      isGitHubLoggedIn,
      notifications,
    } = this.props;
    const notificationsCount = notifications.reduce(
      (memo, acc) => memo + acc.get('notifications').size,
      0
    );

    return (
      <div className="sidebar-wrapper">
        <LogoWhite onClick={this.onOpenBrowser} />

        {isEitherLoggedIn &&
          <div className="badge badge-count text-success my-1">
            {notifications.isEmpty()
              ? 'All Read'
              : `${notificationsCount} Unread`}
          </div>}

        {isEitherLoggedIn &&
          <ul className="nav nav-inline mb-2">
            <li className="nav-item text-white">
              <i
                className="nav-link blah"
                title="Refresh"
                onClick={() => this.refreshNotifications()}
              >
                <Octicon icon={sync} />
              </i>
            </li>

            <li className="nav-item text-white">
              <i
                className="nav-link"
                title="Settings"
                onClick={() => this.props.toggleSettingsModal()}
              >
                <Octicon icon={gear} />
              </i>
            </li>
          </ul>}

        {isGitHubLoggedIn &&
          !this.props.enterpriseAccounts.isEmpty() &&
          this._renderGitHubAccount()}
        {this._renderEnterpriseAccounts()}

        <div className="footer">
          {!!isEitherLoggedIn &&
            <Link
              to="/enterpriselogin"
              className="btn btn-block btn-sm btn-outline-secondary btn-add"
            >
              Add <br />Enterprise
            </Link>}

          {!hasStarred &&
            <button
              className="btn btn-block btn-sm btn-outline-secondary btn-star"
              onClick={this.onOpenBrowser}
            >
              <Octicon icon={markGithub} /> Star
            </button>}
        </div>
      </div>
    );
  }
}

export function mapStateToProps(state) {
  const enterpriseAccounts = state.auth.get('enterpriseAccounts');
  const isGitHubLoggedIn = state.auth.get('token') !== null;
  const connectedAccounts = enterpriseAccounts.reduce(
    memo => memo + 1,
    isGitHubLoggedIn ? 1 : 0
  );

  return {
    isGitHubLoggedIn,
    isEitherLoggedIn: isUserEitherLoggedIn(state.auth),
    notifications: state.notifications.get('response'),
    enterpriseAccounts,
    connectedAccounts,
    hasStarred: state.settings.get('hasStarred'),
  };
}

export default connect(mapStateToProps, {
  fetchNotifications,
  logout,
  toggleSettingsModal,
})(Sidebar);
