import * as React from 'react';
import { connect } from 'react-redux';

const { remote } = require('electron');

import { fetchNotifications, updateSetting, logout } from '../actions';
import { updateTrayIcon } from '../utils/comms';
import { AppState, SettingsState } from '../../types/reducers';

interface IFieldCheckbox {
  name: string;
  label: string;
  checked: boolean;
  onChange: any;
}
const FieldCheckbox = (props: IFieldCheckbox) => {
  return (
    <div className="form-group">
      <div className="custom-control custom-checkbox custom-checkbox-large">
        <input
          type="checkbox"
          id={props.name}
          name={props.name}
          className="custom-control-input"
          checked={props.checked}
          onChange={props.onChange}
        />
        <label className="custom-control-label" htmlFor={props.name}>
          {props.label}
        </label>
      </div>
    </div>
  );
};

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
      <div className="p-4">
        <div>
          <h5>Settings</h5>
          <button
            className="close"
            aria-label="Close Settings"
            onClick={() => this.props.history.goBack()}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
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
        <hr />
        Version: {remote.app.getVersion()}
        <hr />
        <div>
          <button
            aria-label="Logout"
            className="btn btn-outline-danger"
            onClick={() => this.logout()}
          >
            <span className="octicon octicon-sign-out" /> Logout from all
            accounts
          </button>
        </div>
      </div>
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
