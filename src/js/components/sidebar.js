import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { shell } from 'electron';

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
    if (this.props.isEitherLoggedIn) {
      this.props.fetchNotifications();
    }
  }

  openBrowser() {
    shell.openExternal(`http://www.github.com/${Constants.REPO_SLUG}`);
  }

  _renderEnterpriseAccounts() {
    const getDomain = (account) => {
      const splittedHostname = account.get('hostname').split('.');
      return splittedHostname[splittedHostname.length - 2];
    };

    return this.props.enterpriseAccounts.map((account, idx) => (
      <div className="badge badge-primary text-uppercase" key={idx} title={account.get('hostname')}>
        {getDomain(account)}
      </div>
    ));
  }

  render() {
    const { hasStarred, isEitherLoggedIn, isGitHubLoggedIn, notifications } = this.props;

    return (
      <div className="sidebar-wrapper bg-inverse">
        <img
          className="img-fluid logo"
          src="images/gitify-logo-outline-light.png"
          onClick={this.openBrowser} />

        {isEitherLoggedIn && (
          <div className="badge badge-count text-success text-uppercase">
            {notifications.isEmpty() ? 'All Read' : `${notifications.size} Unread`}
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

        {this._renderEnterpriseAccounts()}

        <div className="footer">
          <Link to="/enterpriselogin" className="btn btn-block">Add</Link>

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
    isEitherLoggedIn: state.auth.get('token') !== null || state.auth.get('enterpriseAccounts').size > 0,
    enterpriseAccounts: state.auth.get('enterpriseAccounts'),
  };
};

export default connect(mapStateToProps, { fetchNotifications, logout, toggleSettingsModal })(Sidebar);
