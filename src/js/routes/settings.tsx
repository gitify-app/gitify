const { ipcRenderer, remote } = require('electron');

import * as React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import { AppState, SettingsState } from '../../types/reducers';
import { fetchNotifications, updateSetting, logout } from '../actions';
import { FieldCheckbox } from '../components/ui/checkbox';
import { updateTrayIcon } from '../utils/comms';

const isLinux = remote.process.platform === 'linux';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 1rem;
  padding: 1rem 2rem 0;
`;

const Main = styled.div`
  flex: 1;
  padding: 0 2rem;
`;

const Footer = styled.div`
  margin: 1rem 0 0;
  padding: 0.5rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${(props) => props.theme.grayLight};
  font-size: 0.85rem;
`;

const Title = styled.h3`
  margin: 0;
  font-weight: 500;
`;

const ButtonClose = styled.a`
  border: 0;
  padding: 0.25rem;
  font-size: 2rem;
  font-weight: 500;

  &:hover {
    cursor: pointer;
    color: ${(props) => props.theme.primary};
  }
`;

const ButtonFooter = styled.button`
  border: 0;
  padding: 0.25rem 0.5rem;
  margin: 0.25rem 0.5rem;
  font-size: 0.75rem;
  background-color: ${(props) => props.theme.primary};
  border: 0x solid ${(props) => props.theme.danger};
  border-radius: ${(props) => props.theme.borderRadius};
  color: white;

  &:hover {
    background-color: ${(props) => props.theme.primaryDark};
    color: white;
  }

  &:last-child {
    margin-right: 0;
  }
`;

const InputField = styled.input`
  width: 100%;
  padding: 0.75em 1.25em;
  margin: 0.5em 0;
  display: inline-block;
  border: 0.05em solid #ccc;
  border-radius: 0.25em;
  box-sizing: border-box;
`;

interface IProps {
  hasMultipleAccounts: boolean;
  fetchNotifications: () => any;
  logout: () => any;
  settings: SettingsState;
  updateSetting: any;
  history: any;
}

export class SettingsRoute extends React.Component<IProps> {
  constructor(props) {
    super(props);

    this.state = {
      participating: props.settings.participating,
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.settings.participating !== state.participating) {
      props.fetchNotifications();
    }

    return {
      participating: props.settings.participating,
    };
  }

  logout() {
    this.props.logout();
    this.props.history.goBack();
    updateTrayIcon();
  }

  quitApp() {
    ipcRenderer.send('app-quit');
  }

  goToEnterprise() {
    return this.props.history.replace('/enterpriselogin');
  }

  render() {
    const { hasMultipleAccounts, settings } = this.props;

    return (
      <Wrapper>
        <Header>
          <Title>Settings</Title>

          <ButtonClose
            aria-label="Close Settings"
            onClick={() => this.props.history.goBack()}
          >
            &times;
          </ButtonClose>
        </Header>
        <Main>
          <FieldCheckbox
            name="showOnlyParticipating"
            label="Show only participating"
            checked={settings.participating}
            onChange={(evt) =>
              this.props.updateSetting('participating', evt.target.checked)
            }
          />
          <FieldCheckbox
            name="playSound"
            label="Play sound"
            checked={settings.playSound}
            onChange={(evt) =>
              this.props.updateSetting('playSound', evt.target.checked)
            }
          />
          <FieldCheckbox
            name="showNotifications"
            label="Show notifications"
            checked={settings.showNotifications}
            onChange={(evt) =>
              this.props.updateSetting('showNotifications', evt.target.checked)
            }
          />
          <FieldCheckbox
            name="onClickMarkAsRead"
            label="On Click, Mark as Read"
            checked={settings.markOnClick}
            onChange={(evt) =>
              this.props.updateSetting('markOnClick', evt.target.checked)
            }
          />
          <FieldCheckbox
            name="usePAT"
            label="Use PAT token instead of oauth"
            checked={settings.usePAT}
            onChange={(evt) =>
                this.props.updateSetting('usePAT', evt.target.checked)
            }
          />
          <div style={{"display": (settings.usePAT ? "block" : "none")}}>
             <div>
                 <label htmlFor="patTokenId">Enter personal access token</label>
             </div>
             <InputField
                id="patTokenId"
                name="patToken"
                type="password"
                value={settings.patToken}
                onChange={(evt) =>
                    this.props.updateSetting('patToken', evt.target.value)
                }
                className="form-control"
              />
          </div>
          {!isLinux && (
            <FieldCheckbox
              name="openAtStartUp"
              label="Open at startup"
              checked={settings.openAtStartup}
              onChange={(evt) =>
                this.props.updateSetting('openAtStartup', evt.target.checked)
              }
            />
          )}
        </Main>

        <Footer>
          <small>Gitify v{remote.app.getVersion()}</small>

          <div>
            <ButtonFooter
              aria-label="Login with GitHub Enterprise"
              onClick={this.goToEnterprise.bind(this)}
            >
              Add Enterprise
            </ButtonFooter>

            <ButtonFooter aria-label="Logout" onClick={this.logout.bind(this)}>
              {hasMultipleAccounts ? 'Logout from all accounts' : 'Logout'}
            </ButtonFooter>

            <ButtonFooter aria-label="Quit Gitify" onClick={this.quitApp}>
              Quit
            </ButtonFooter>
          </div>
        </Footer>
      </Wrapper>
    );
  }
}

export function mapStateToProps(state: AppState) {
  const enterpriseAccounts = state.auth.enterpriseAccounts;
  const isGitHubLoggedIn = state.auth.token !== null;
  const hasMultipleAccounts = isGitHubLoggedIn
    ? enterpriseAccounts.length > 0
    : enterpriseAccounts.length > 1;

  return {
    settings: state.settings,
    hasMultipleAccounts,
  };
}

export default connect(mapStateToProps, {
  updateSetting,
  fetchNotifications,
  logout,
})(SettingsRoute);
