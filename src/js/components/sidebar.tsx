import * as React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { shell } from 'electron';
import * as Octicons from '@primer/octicons-react';

import { AppState } from '../../types/reducers';
import { fetchNotifications, logout } from '../actions';
import { isUserEitherLoggedIn } from '../utils/helpers';
import { Logo } from './ui/logo';
import Constants from '../utils/constants';

interface IProps {
  fetchNotifications: () => void;

  connectedAccounts: number;
  notificationsCount: number;
  isEitherLoggedIn: boolean;

  history: any;
  location: any;
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
    shell.openExternal(`https://github.com/${Constants.REPO_SLUG}`);
  }

  goToSettings() {
    if (this.props.location.pathname === '/settings') {
      return this.props.history.goBack();
    }
    return this.props.history.push('/settings');
  }

  render() {
    const { isEitherLoggedIn, notificationsCount } = this.props;

    const footerButtonClasses =
      'flex justify-evenly items-center bg-transparent border-0 w-full text-sm text-white my-1 py-2 cursor-pointer hover:text-gray-500 focus:outline-none';

    return (
      <div className="flex flex-col fixed left-14 w-14 -ml-14 h-full bg-primary overflow-y-auto	">
        <div className="flex flex-col flex-1 items-center py-4">
          <Logo
            className="w-5 my-3 mx-auto cursor-pointer"
            onClick={this.onOpenBrowser}
          />

          {notificationsCount > 0 && (
            <div className="flex justify-around	self-stretch items-center my-1 py-1 px-2 text-green-500 text-xs font-extrabold">
              <Octicons.BellIcon size={12} />
              {notificationsCount}
            </div>
          )}
        </div>

        <div className="py-4 px-3">
          {isEitherLoggedIn && (
            <>
              <div
                className={footerButtonClasses}
                onClick={this.refreshNotifications.bind(this)}
                aria-label="Refresh Notifications"
              >
                <Octicons.SyncIcon size={16} />
              </div>

              <div
                className={footerButtonClasses}
                onClick={this.goToSettings.bind(this)}
                aria-label="Settings"
              >
                <Octicons.GearIcon size={16} />
              </div>
            </>
          )}

          <div
            className={footerButtonClasses}
            onClick={this.onOpenBrowser}
            aria-label="View project on GitHub"
          >
            <Octicons.MarkGithubIcon size={14} />
          </div>
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
    isEitherLoggedIn: isUserEitherLoggedIn(state.auth),
    notificationsCount,
    connectedAccounts,
  };
}

export default compose(
  withRouter,
  connect(mapStateToProps, {
    fetchNotifications,
    logout,
  })
)(Sidebar) as any;
