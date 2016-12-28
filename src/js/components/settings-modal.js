import React from 'react';
import { connect } from 'react-redux';
import Modal from 'react-modal';
import Toggle from 'react-toggle';

const ipcRenderer = window.require('electron').ipcRenderer;

import { fetchNotifications, updateSetting, logout, toggleSettingsModal } from '../actions';

const modalStyles = {
  overlay : {
    backgroundColor   : 'rgba(255, 255, 255, 0.95)',
    zIndex            : 9999
  },
  content : {
    position                   : 'absolute',
    top                        : '50px',
    left                       : '25px',
    right                      : '25px',
    bottom                     : '50px',
    border                     : '1px solid #ccc',
    background                 : '#fff',
    overflow                   : 'auto',
    WebkitOverflowScrolling    : 'touch',
    borderRadius               : '4px',
    outline                    : 'none',
    padding                    : '20px'
  }
};

export class SettingsModal extends React.Component {
  componentWillReceiveProps(nextProps) {
    if (nextProps.settings.get('participating') !== this.props.settings.get('participating')) {
      this.props.fetchNotifications();
    }
  }

  logout() {
    this.props.logout();
    this.context.router.replace('/login');
    ipcRenderer.send('update-icon', 'IconPlain');
  }

  checkForUpdates() {
    ipcRenderer.send('check-update');
  }

  appQuit() {
    ipcRenderer.send('app-quit');
  }

  render() {
    const appVersion = require('../../../package.json').version;
    const { settings, isOpen } = this.props;

    return (
      <Modal
        className="settings"
        isOpen={isOpen}
        style={modalStyles}
        contentLabel="Settings Modal">
        <h3 className="modal-title">
          Settings
          <i
            className="fa fa-times btn-close pull-right"
            onClick={() => this.props.toggleSettingsModal()} />
        </h3>

        <ul className="nav nav-pills">
          <li className="nav-item">
            <a className="nav-link" onClick={this.checkForUpdates}>
              <i className="fa fa-cloud-download" /> Update
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" onClick={this.logout.bind(this)}>
              <i className="fa fa-sign-out" /> Logout
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" onClick={this.appQuit}>
              <i className="fa fa-power-off" /> Quit Gitify
            </a>
          </li>
        </ul>

        <div className="row setting">
          <div className="col-xs-8">Show only participating</div>
          <div className="col-xs-4">
            <Toggle
              defaultChecked={settings.get('participating')}
              onChange={(evt) => this.props.updateSetting('participating', evt.target.checked)} />
          </div>
        </div>

        <div className="row setting">
          <div className="col-xs-8">Play sound</div>
          <div className="col-xs-4">
            <Toggle
              defaultChecked={settings.get('playSound')}
              onChange={(evt) => this.props.updateSetting('playSound', evt.target.checked)} />
          </div>
        </div>

        <div className="row setting">
          <div className="col-xs-8">Show notifications</div>
          <div className="col-xs-4">
            <Toggle
              defaultChecked={settings.get('showNotifications')}
              onChange={(evt) => this.props.updateSetting('showNotifications', evt.target.checked)} />
          </div>
        </div>

        <div className="row setting">
          <div className="col-xs-8">On Click, Mark as Read</div>
          <div className="col-xs-4">
            <Toggle
              defaultChecked={settings.get('markOnClick')}
              onChange={(evt) => this.props.updateSetting('markOnClick', evt.target.checked)} />
          </div>
        </div>

        <div className="row setting">
          <div className="col-xs-8">Open at startup</div>
          <div className="col-xs-4">
            <Toggle
              defaultChecked={settings.get('openAtStartup')}
              onChange={(evt) => this.props.updateSetting('openAtStartup', evt.target.checked)} />
          </div>
        </div>

        <div className="row footer">
          <div className="col-xs-6 text-left">Made with <span className="heart">❤</span> in Brighton.</div>
          <div className="col-xs-6 text-right">Gitify - Version: {appVersion}</div>
        </div>
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
