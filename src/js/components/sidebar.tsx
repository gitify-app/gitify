import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { List, Map } from 'immutable';
import { shell } from 'electron';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

import { fetchNotifications, logout, toggleSettingsModal } from '../actions';
import { isUserEitherLoggedIn } from '../utils/helpers';
import { LogoWhite } from './logos/white';
import Constants from '../utils/constants';
import { ToggleSettingsModalAction } from '../../types/actions';

interface IProps {
  fetchNotifications: () => void;
  connectedAccounts: number;

  enterpriseAccounts: any; // PropTypes.object.isRequired;
  notifications: any; // PropTypes.object.isRequired;

  toggleSettingsModal: () => ToggleSettingsModalAction;
  hasStarred: boolean;
  isEitherLoggedIn: boolean;
  isGitHubLoggedIn: boolean;
}

export class Sidebar extends React.Component<IProps> {
  requestInterval: NodeJS.Timer;

  componentDidMount() {
    const self = this;
    const iFrequency = 5000;

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
          className={`badge-account${
            enterpriseAccounts.size === idx + 1 ? ' last' : ''
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
    } = this.props;
    const notificationsCount = notifications.reduce(
      (memo, acc) => memo + acc.get('notifications').size,
      0
    );

    return (
      <div className="sidebar-wrapper">
        <LogoWhite onClick={this.onOpenBrowser} />

        {isEitherLoggedIn && (
          <div className="badge badge-count text-success my-1">
            {notifications.isEmpty()
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
              <FontAwesomeIcon
                className="mx-1"
                icon={faCog}
                onClick={() => this.props.toggleSettingsModal()}
                title="Settings"
                fixedWidth
              />
            </li>
          </ul>
        )}

        {isGitHubLoggedIn &&
          !this.props.enterpriseAccounts.isEmpty() &&
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
