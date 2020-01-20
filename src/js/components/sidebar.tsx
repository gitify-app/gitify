import * as React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { shell } from 'electron';
import Octicon, { Bell, Gear, Sync, MarkGithub } from '@primer/octicons-react';
import styled from 'styled-components';

import { AppState } from '../../types/reducers';
import { fetchNotifications, logout } from '../actions';
import { isUserEitherLoggedIn } from '../utils/helpers';
import { LogoWhite } from './logos/white';
import Constants from '../utils/constants';

export const SIDEBAR_WIDTH = '50px';

const Wrapper = styled.div`
  position: fixed;
  left: ${SIDEBAR_WIDTH};
  margin-left: -${SIDEBAR_WIDTH};
  background-color: ${props => props.theme.purple};
  width: ${SIDEBAR_WIDTH};
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  .logo {
    width: 1.25rem;
    margin: 0.75rem auto;

    &:hover {
      cursor: pointer;
    }
  }
`;

const Main = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 0;
`;

const Status = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-self: stretch;
  align-items: center;
  margin: 0.25rem 0;
  padding: 0.25rem 0.55rem;
  color: ${props => props.theme.success};
  font-size: 75%;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  text-transform: uppercase;
`;

const Footer = styled.div`
  padding: 1rem 0.75rem;
`;

const FooterButton = styled.button`
  display: flex;
  justify-content: space-evenly;
  align-items: center;

  background-color: transparent;
  border: 0;
  width: 100%;

  font-size: 0.8rem;
  margin-top: 0.25rem;
  padding: 0.35rem 0;
  color: white;

  &:hover {
    color: ${props => props.theme.purpleDark};
  }

  &:focus {
    outline: 0;
  }
`;

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
    shell.openExternal(`https://www.github.com/${Constants.REPO_SLUG}`);
  }

  goToSettings() {
    if (this.props.location.pathname === '/settings') {
      return this.props.history.goBack();
    }
    return this.props.history.push('/settings');
  }

  render() {
    const { notificationsCount } = this.props;

    return (
      <Wrapper>
        <Main>
          <LogoWhite onClick={this.onOpenBrowser} />

          {notificationsCount > 0 && (
            <Status>
              <Octicon icon={Bell} size={14} />
              {notificationsCount}
            </Status>
          )}
        </Main>

        <Footer>
          <FooterButton
            onClick={this.refreshNotifications.bind(this)}
            aria-label="Refresh Notifications"
          >
            <Octicon icon={Sync} size={16} />
          </FooterButton>

          <FooterButton
            onClick={this.goToSettings.bind(this)}
            aria-label="Settings"
          >
            <Octicon icon={Gear} size={16} />
          </FooterButton>

          <FooterButton
            onClick={this.onOpenBrowser}
            aria-label="View project on GitHub"
          >
            <Octicon icon={MarkGithub} size={14} />
          </FooterButton>
        </Footer>
      </Wrapper>
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
)(Sidebar);
