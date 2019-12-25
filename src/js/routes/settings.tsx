import * as React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

const { remote } = require('electron');

import { AppState, SettingsState } from '../../types/reducers';
import { fetchNotifications, updateSetting, logout } from '../actions';
import { FieldCheckbox } from '../components/ui/checkbox';
import { updateTrayIcon } from '../utils/comms';

interface IFieldRadio {
  name: string;
  label: string;
  value: string;
  checked: boolean;
  onChange: any;
}
const FieldRadio = (props: IFieldRadio) => {
  return (
    <div className="custom-control custom-radio custom-control-inline">
      <input
        type="radio"
        id={`${props.name}-${props.value}`}
        name={props.name}
        className="custom-control-input"
        value={props.value}
        checked={props.checked}
        onChange={evt => props.onChange(props.name, evt.target.value)}
      />
      <label
        className="custom-control-label"
        htmlFor={`${props.name}-${props.value}`}
      >
        {props.label}
      </label>
    </div>
  );
};

const Wrapper = styled.div`
  padding: 2rem;
`;

const Header = styled.div`
  margin: 0 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Footer = styled.div`
  margin: 1rem 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h3`
  margin: 0;
  font-weight: 500;
`;

const ButtonClose = styled.button`
  border: 0;
  padding: 0.25rem;
  font-size: 2rem;
  font-weight: 500;

  &:hover {
    cursor: pointer;
    color: ${props => props.theme.primary};
  }
`;

const ButtonLogout = styled.button`
  border: 0;
  padding: 0.25rem 0.5rem;
  text-transform: uppercase;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid ${props => props.theme.danger};
  border-radius: ${props => props.theme.borderRadius};

  &:hover {
    background-color: ${props => props.theme.danger};
    color: white;
  }
`;

interface IProps {
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

  render() {
    const { settings } = this.props;

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
        <FieldCheckbox
          name="showOnlyParticipating"
          label="Show only participating"
          checked={settings.participating}
          onChange={evt =>
            this.props.updateSetting('participating', evt.target.checked)
          }
        />
        <FieldCheckbox
          name="playSound"
          label="Play sound"
          checked={settings.playSound}
          onChange={evt =>
            this.props.updateSetting('playSound', evt.target.checked)
          }
        />
        <FieldCheckbox
          name="showNotifications"
          label="Show notifications"
          checked={settings.showNotifications}
          onChange={evt =>
            this.props.updateSetting('showNotifications', evt.target.checked)
          }
        />
        <FieldCheckbox
          name="onClickMarkAsRead"
          label="On Click, Mark as Read"
          checked={settings.markOnClick}
          onChange={evt =>
            this.props.updateSetting('markOnClick', evt.target.checked)
          }
        />
        <FieldCheckbox
          name="openAtStartUp"
          label="Open at startup"
          checked={settings.openAtStartup}
          onChange={evt =>
            this.props.updateSetting('openAtStartup', evt.target.checked)
          }
        />
        <div>
          <form>
            <FieldRadio
              name="showAppIcon"
              value="both"
              checked={settings.showAppIcon === 'both'}
              label="Both Icons"
              onChange={this.props.updateSetting}
            />
            <FieldRadio
              name="showAppIcon"
              value="tray"
              checked={settings.showAppIcon === 'tray'}
              label="Tray Icon"
              onChange={this.props.updateSetting}
            />
            <FieldRadio
              name="showAppIcon"
              value="dock"
              checked={settings.showAppIcon === 'dock'}
              label="Dock Icon"
              onChange={this.props.updateSetting}
            />
          </form>
        </div>

        <Footer>
          <small>Version: {remote.app.getVersion()}</small>
          <ButtonLogout
            aria-label="Logout"
            className="btn btn-outline-danger"
            onClick={() => this.logout()}
          >
            <span className="octicon octicon-sign-out" /> Logout from all
            accounts
          </ButtonLogout>
        </Footer>
      </Wrapper>
    );
  }
}

export function mapStateToProps(state: AppState) {
  return {
    settings: state.settings,
  };
}

export default connect(mapStateToProps, {
  updateSetting,
  fetchNotifications,
  logout,
})(SettingsRoute);
