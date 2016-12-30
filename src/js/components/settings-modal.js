import React from 'react';
import { connect } from 'react-redux';
import Modal from 'react-modal';
import { Checkbox, RadioGroup, Radio } from 'react-icheck';

const ipcRenderer = window.require('electron').ipcRenderer;

import { fetchNotifications, updateSetting, logout, toggleSettingsModal } from '../actions';

export class SettingsModal extends React.Component {
  componentWillReceiveProps(nextProps) {
    if (nextProps.settings.get('participating') !== this.props.settings.get('participating')) {
      this.props.fetchNotifications();
    }
  }

  onEscape({ keyCode }) {
    if (keyCode === 27) {
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
    this.context.router.replace('/login');
    ipcRenderer.send('update-icon', 'IconPlain');
  }

  render() {
    const { settings, isOpen } = this.props;

    return (
      <Modal
        className="settings-modal bg-inverse"
        isOpen={isOpen}
        contentLabel="Settings Modal">
        <h3 className="modal-title">
          Settings
          <span
            className="octicon octicon-x btn-close pull-right"
            onClick={() => this.props.toggleSettingsModal()} />
        </h3>

        <div className="row setting">
          <Checkbox
            label="Show only participating"
            checkboxClass="icheckbox_polaris setting-checkbox"
            defaultChecked={settings.get('participating')}
            onChange={(evt) => this.props.updateSetting('participating', evt.target.checked)} />
        </div>

        <div className="row setting">
          <Checkbox
            label="Play sound"
            checkboxClass="icheckbox_polaris setting-checkbox"
            defaultChecked={settings.get('playSound')}
            onChange={(evt) => this.props.updateSetting('playSound', evt.target.checked)} />
        </div>

        <div className="row setting">
          <Checkbox
            label="Show notifications"
            checkboxClass="icheckbox_polaris setting-checkbox"
            defaultChecked={settings.get('showNotifications')}
            onChange={(evt) => this.props.updateSetting('showNotifications', evt.target.checked)} />
        </div>

        <div className="row setting">
          <Checkbox
            label="On Click, Mark as Read"
            checkboxClass="icheckbox_polaris setting-checkbox"
            defaultChecked={settings.get('markOnClick')}
            onChange={(evt) => this.props.updateSetting('markOnClick', evt.target.checked)} />
        </div>

        <div className="row setting">
          <Checkbox
            label="Open at startup"
            checkboxClass="icheckbox_polaris setting-checkbox"
            defaultChecked={settings.get('openAtStartup')}
            onChange={(evt) => this.props.updateSetting('openAtStartup', evt.target.checked)} />
        </div>

      <RadioGroup
        name="showAppIcon"
        value={settings.get('showAppIcon')}
        onChange={(evt) => this.props.updateSetting('showAppIcon', evt.target.value)}>
        <Radio
          value="both"
          radioClass="iradio_polaris setting-radio"
          label="Both Icons" />

        <Radio
          value="tray"
          radioClass="iradio_polaris setting-radio"
          label="Tray Icon" />

        <Radio
          value="dock"
          radioClass="iradio_polaris setting-radio"
          label="Dock Icon" />
      </RadioGroup>

      <button className="btn btn-block btn-outline-danger btn-logout" onClick={() => this.logout()}>
        <span className="octicon octicon-sign-out" /> Logout
      </button>
    </Modal>
    );
  }
};

SettingsModal.contextTypes = {
  router: React.PropTypes.object.isRequired
};

SettingsModal.propTypes = {
  isOpen: React.PropTypes.bool.isRequired
};

function mapStateToProps(state) {
  return {
    settings: state.settings
  };
};

export default connect(mapStateToProps, {
  updateSetting,
  fetchNotifications,
  logout,
  toggleSettingsModal
})(SettingsModal);
