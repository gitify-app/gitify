import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { shell } from 'electron';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

import {
  AppState,
  EnterpriseAccount,
  AccountNotifications,
} from '../../types/reducers';
import { fetchNotifications, logout } from '../actions';
import { isUserEitherLoggedIn } from '../utils/helpers';
import { LogoWhite } from './logos/white';
import Constants from '../utils/constants';

interface IProps {
  fetchNotifications: () => void;
  connectedAccounts: number;

  enterpriseAccounts: EnterpriseAccount[];
  notifications: AccountNotifications[];
  notificationsCount: number;

  hasStarred: boolean;
  isEitherLoggedIn: boolean;
  isGitHubLoggedIn: boolean;
}

export class Sidebar extends React.Component<IProps> {
  requestInterval: any;

  componentDidMount() {
    const self = this;
    const iFrequency = 60000;

    this.requestInterval = setInterval(() => {
      self.refreshNotifications();
    }, iFrequency);
  }

  state = {
    connectedAccounts: [],
  };

  static getDerivedStateFromProps(props, state) {
    if (props.connectedAccounts > state.connectedAccounts) {
      props.fetchNotifications();
    }

    return {
      connectedAccounts: props.connectedAccounts,
    };
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
    const notificationsCount = notifications.find(
      obj => obj.hostname === defaultHostname
    ).notifications.length;

    return (
      <div
        className={`badge-account ${enterpriseAccounts.length === 0 && 'last'}`}
        title={defaultHostname}
      >
        <div className="mr-auto name">GitHub</div>
        <div>
          {notificationsCount === 0 ? (
            <span className="octicon octicon-check" />
          ) : (
            notificationsCount
          )}
        </div>
      </div>
    );
  }

  _renderEnterpriseAccounts() {
    const { enterpriseAccounts, notifications } = this.props;

    return enterpriseAccounts.map((account, idx) => {
      const splittedHostname = account.hostname.split('.');
      const accountDomain = splittedHostname[splittedHostname.length - 2];
      const notificationsCount = notifications.find(
        obj => obj.hostname === account.hostname
      ).notifications.length;

      return (
        <div
          key={idx}
          title={account.hostname}
          className={`badge-account${
            enterpriseAccounts.length === idx + 1 ? ' last' : ''
          }`}
        >
          <div className="mr-auto name">{accountDomain}</div>
          <div>
            {notificationsCount === 0 ? (
              <span className="octicon octicon-check" />
            ) : (
              notificationsCount
            )}
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
      notificationsCount,
    } = this.props;

    return (
      <div className="sidebar-wrapper">
        <LogoWhite onClick={this.onOpenBrowser} />

        {isEitherLoggedIn && (
          <div className="badge badge-count text-success my-1">
            {notifications.length === 0
              ? 'All Read'
              : `${notificationsCount} Unread`}
          </div>
        )}

        {isEitherLoggedIn && (
          <ul className="nav nav-inline mb-2">
            <li className="nav-item text-white">
              <FontAwesomeIcon
                className="mx-1"
                icon={faSyncAlt}
                onClick={() => this.refreshNotifications()}
                title="Refresh"
                fixedWidth
              />
            </li>

            <li className="nav-item text-white">
              <Link to="/settings">
                <FontAwesomeIcon
                  className="mx-1"
                  icon={faCog}
                  title="Settings"
                  fixedWidth
                />
              </Link>
            </li>
          </ul>
        )}

        {isGitHubLoggedIn &&
          this.props.enterpriseAccounts.length !== 0 &&
          this._renderGitHubAccount()}
        {this._renderEnterpriseAccounts()}

        <div className="footer">
          {!!isEitherLoggedIn && (
            <Link
              to="/enterpriselogin"
              className="btn btn-block btn-sm btn-outline-secondary btn-add"
            >
              Add <br />
              Enterprise
            </Link>
          )}

          {!hasStarred && (
            <button
              className="btn btn-block btn-sm btn-outline-secondary btn-star"
              onClick={this.onOpenBrowser}
            >
              <FontAwesomeIcon icon={faGithub} title="GitHub" /> Star
            </button>
          )}
        </div>
      </div>
    );
  }
}

export function mapStateToProps(state: AppState) {
  const enterpriseAccounts = state.auth.enterpriseAccounts;
  const isGitHubLoggedIn = state.auth.token !== null;
  const connectedAccounts = isGitHubLoggedIn
    ? enterpriseAccounts.length + 1
    : enterpriseAccounts.length;

  const notificationsCount = state.notifications.response.reduce(
    (memo, account) => memo + account.notifications.length,
    0
  );

  return {
    isGitHubLoggedIn,
    isEitherLoggedIn: isUserEitherLoggedIn(state.auth),
    notifications: state.notifications.response,
    notificationsCount,
    enterpriseAccounts,
    connectedAccounts,
    hasStarred: state.settings.hasStarred,
  };
}

export default connect(mapStateToProps, {
  fetchNotifications,
  logout,
})(Sidebar);
