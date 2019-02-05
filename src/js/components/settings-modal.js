import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import Modal from 'react-modal';
import { Checkbox, Radio } from 'antd';
import Octicon, { signOut } from 'octicons-react';

const RadioGroup = Radio.Group;
const { remote } = require('electron');

import {
  fetchNotifications,
  updateSetting,
  logout,
  toggleSettingsModal,
} from '../actions';
import { updateTrayIcon } from '../utils/comms';
import { isUserEitherLoggedIn } from '../utils/helpers';

export class SettingsModal extends React.Component {
  static propTypes = {
    fetchNotifications: PropTypes.func.isRequired,
    toggleSettingsModal: PropTypes.func.isRequired,
    logout: PropTypes.func.isRequired,
    settings: PropTypes.object.isRequired,
    isEitherLoggedIn: PropTypes.bool.isRequired,
    updateSetting: PropTypes.func.isRequired,
  };

  componentDidMount() {
    document.addEventListener('keydown', event => this.onEscape(event));
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.settings.get('participating') !==
      this.props.settings.get('participating')
    ) {
      this.props.fetchNotifications();
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', event => this.onEscape(event));
  }

  onEscape({ keyCode }) {
    if (keyCode === 27 && this.props.settings.get('showSettingsModal')) {
      this.props.toggleSettingsModal();
    }
  }

  logout() {
    this.props.logout();
    this.props.toggleSettingsModal();
    updateTrayIcon();
  }

  render() {
    const { settings, isEitherLoggedIn } = this.props;

    if (!isEitherLoggedIn) {
      return <Redirect to="/login" />;
    }

    return (
      <Modal
        className="modal-dialog settings-modal"
        overlayClassName="modal-overlay"
        closeTimeoutMS={250}
        isOpen={settings.get('showSettingsModal')}
        contentLabel="Settings Modal"
      >
        <div className="modal-content">

          <div className="modal-header">
            <h5 className="modal-title">Settings</h5>
            <button
              className="close"
              aria-label="Close"
              onClick={() => this.props.toggleSettingsModal()}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>

          <div className="modal-body">
            <div className="row setting">
              <Checkbox
                className="setting-participating"
                checked={settings.get('participating')}
                onChange={evt =>
                  this.props.updateSetting('participating', evt.target.checked)}
              >
                Show only participating
              </Checkbox>
            </div>

            <div className="row setting">
              <Checkbox
                className="setting-play-sound"
                checked={settings.get('playSound')}
                onChange={evt =>
                  this.props.updateSetting('playSound', evt.target.checked)}
              >
                Play sound
              </Checkbox>
            </div>

            <div className="row setting">
              <Checkbox
                className="setting-notifications"
                checked={settings.get('showNotifications')}
                onChange={evt =>
                  this.props.updateSetting(
                    'showNotifications',
                    evt.target.checked
                  )}
              >
                Show notifications
              </Checkbox>
            </div>

            <div className="row setting">
              <Checkbox
                className="setting-mark-as-read"
                checked={settings.get('markOnClick')}
                onChange={evt =>
                  this.props.updateSetting('markOnClick', evt.target.checked)}
              >
                On Click, Mark as Read
              </Checkbox>
            </div>

            <div className="row setting">
              <Checkbox
                className="setting-open-at-startup"
                checked={settings.get('openAtStartup')}
                onChange={evt =>
                  this.props.updateSetting('openAtStartup', evt.target.checked)}
              >
                Open at startup
              </Checkbox>
            </div>

            <RadioGroup
              value={settings.get('showAppIcon')}
              onChange={evt =>
                this.props.updateSetting('showAppIcon', evt.target.value)}
            >
              <Radio value="both" className="setting-radio">
                Both Icons
              </Radio>

              <Radio value="tray" className="setting-radio">
                Tray Icon
              </Radio>

              <Radio value="dock" className="setting-radio">
                Dock Icon
              </Radio>
            </RadioGroup>

            <hr />

            Version: {remote.app.getVersion()}
          </div>

          <div className="modal-footer">
            <button
              className="btn btn-logout btn-outline-danger"
              onClick={() => this.logout()}
            >
              <Octicon icon={signOut} /> Logout from all
              accounts
            </button>
          </div>
        </div>
      </Modal>
    );
  }
}

export function mapStateToProps(state) {
  return {
    isEitherLoggedIn: isUserEitherLoggedIn(state.auth),
    settings: state.settings,
  };
}

export default connect(mapStateToProps, {
  updateSetting,
  fetchNotifications,
  logout,
  toggleSettingsModal,
})(SettingsModal);
