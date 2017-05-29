import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import Modal from 'react-modal';
import { Checkbox, RadioGroup, Radio } from 'react-icheck';

const { remote } = require('electron');

import { fetchNotifications, updateSetting, logout, toggleSettingsModal } from '../actions';
import { updateTrayIcon } from '../utils/comms';
import { isUserEitherLoggedIn } from '../utils/helpers';

export class SettingsModal extends React.Component {
  componentWillReceiveProps(nextProps) {
    if (nextProps.settings.get('participating') !== this.props.settings.get('participating')) {
      this.props.fetchNotifications();
    }
  }

  onEscape({ keyCode }) {
    if (keyCode === 27 && this.props.settings.get('showSettingsModal')) {
      this.props.toggleSettingsModal();
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', (event) => this.onEscape(event));
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', (event) => this.onEscape(event));
  }

  logout() {
    this.props.logout();
    this.props.toggleSettingsModal();
    updateTrayIcon();
  }

  render() {
    const { settings, isEitherLoggedIn } = this.props;

    if (!isEitherLoggedIn) {
      return (
        <Redirect to="/login" />
      );
    }

    return (
      <Modal
        className="modal-dialog settings-modal"
        overlayClassName="modal-overlay"
        closeTimeoutMS={250}
        isOpen={settings.get('showSettingsModal')}
        contentLabel="Settings Modal">
        <div className="modal-content">

          <div className="modal-header">
            <h5 className="modal-title">Settings</h5>
            <button className="close" aria-label="Close" onClick={() => this.props.toggleSettingsModal()}>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>

          <div className="modal-body">
            <div className="row setting">
              <Checkbox
                label="Show only participating"
                checkboxClass="icheckbox_square-green setting-checkbox"
                defaultChecked={settings.get('participating')}
                onChange={(evt) => this.props.updateSetting('participating', evt.target.checked)} />
            </div>

            <div className="row setting">
              <Checkbox
                label="Play sound"
                checkboxClass="icheckbox_square-green setting-checkbox"
                defaultChecked={settings.get('playSound')}
                onChange={(evt) => this.props.updateSetting('playSound', evt.target.checked)} />
            </div>

            <div className="row setting">
              <Checkbox
                label="Show notifications"
                checkboxClass="icheckbox_square-green setting-checkbox"
                defaultChecked={settings.get('showNotifications')}
                onChange={(evt) => this.props.updateSetting('showNotifications', evt.target.checked)} />
            </div>

            <div className="row setting">
              <Checkbox
                label="On Click, Mark as Read"
                checkboxClass="icheckbox_square-green setting-checkbox"
                defaultChecked={settings.get('markOnClick')}
                onChange={(evt) => this.props.updateSetting('markOnClick', evt.target.checked)} />
            </div>

            <div className="row setting">
              <Checkbox
                label="Open at startup"
                checkboxClass="icheckbox_square-green setting-checkbox"
                defaultChecked={settings.get('openAtStartup')}
                onChange={(evt) => this.props.updateSetting('openAtStartup', evt.target.checked)} />
            </div>

            <RadioGroup
              name="showAppIcon"
              value={settings.get('showAppIcon')}
              onChange={(evt) => this.props.updateSetting('showAppIcon', evt.target.value)}>
              <Radio
                value="both"
                radioClass="iradio_square-green setting-radio"
                label="Both Icons" />

              <Radio
                value="tray"
                radioClass="iradio_square-green setting-radio"
                label="Tray Icon" />

              <Radio
                value="dock"
                radioClass="iradio_square-green setting-radio"
                label="Dock Icon" />
            </RadioGroup>

            <hr />

            Version: {remote.app.getVersion()}
          </div>

          <div className="modal-footer">
            <button className="btn btn-outline-danger" onClick={() => this.logout()}>
              <span className="octicon octicon-sign-out" /> Logout
            </button>

            <button className="btn btn-secondary" onClick={() => this.props.toggleSettingsModal()}>
              Close
            </button>
          </div>
        </div>
      </Modal>
    );
  }
};

export function mapStateToProps(state) {
  return {
    isEitherLoggedIn: isUserEitherLoggedIn(state.auth),
    settings: state.settings,
  };
};

export default connect(mapStateToProps, {
  updateSetting,
  fetchNotifications,
  logout,
  toggleSettingsModal
})(SettingsModal);
