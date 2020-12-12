const { ipcRenderer, remote } = require('electron');

import * as React from 'react';
import { connect } from 'react-redux';
import { ArrowLeftIcon } from '@primer/octicons-react';

import { AppState, SettingsState } from '../../types/reducers';
import { fetchNotifications, updateSetting, logout } from '../actions';
import { FieldCheckbox } from '../components/ui/checkbox';
import { updateTrayIcon } from '../utils/comms';

const isLinux = remote.process.platform === 'linux';

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

    const footerButtonClass =
      'bg-gray-400 hover:bg-gray-500 hover:text-white rounded py-1 px-2 my-1 mx-2 text-sm focus:outline-none';

    return (
      <div className="flex flex-1 flex-col">
        <div className="flex justify-between items-center mt-4 py-2 mx-8">
          <button
            className="focus:outline-none"
            aria-label="Go Back"
            onClick={() => this.props.history.goBack()}
          >
            <ArrowLeftIcon size={20} className="hover:text-gray-400" />
          </button>

          <h3 className="text-lg font-semibold">Settings</h3>
        </div>

        <div className="flex-1 px-8">
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
        </div>

        <div className="flex justify-between items-center bg-gray-300 py-4 px-8">
          <small className="font-semibold">
            Gitify v{remote.app.getVersion()}
          </small>

          <div>
            <button
              className={footerButtonClass}
              aria-label="Login with GitHub Enterprise"
              onClick={this.goToEnterprise.bind(this)}
            >
              Add Enterprise
            </button>

            <button
              className={footerButtonClass}
              aria-label="Logout"
              onClick={this.logout.bind(this)}
            >
              {hasMultipleAccounts ? 'Logout from all accounts' : 'Logout'}
            </button>

            <button
              className={`${footerButtonClass} mr-0`}
              aria-label="Quit Gitify"
              onClick={this.quitApp}
            >
              Quit
            </button>
          </div>
        </div>
      </div>
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
