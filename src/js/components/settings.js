import React from 'react';
import { connect } from 'react-redux';
import Toggle from 'react-toggle';

const ipcRenderer = window.require('electron').ipcRenderer;

import { updateSetting } from '../actions';

var Actions = {}; // FIXME!
// var SettingsStore = require('../stores/settings');

class SettingsPage extends React.Component {
  toggleSetting(key, event) {
    Actions.setSetting(key, event.target.checked);
  }

  checkForUpdates() {
    ipcRenderer.send('check-update');
  }

  appQuit() {
    ipcRenderer.send('app-quit');
  }

  render() {
    const appVersion = require('../../../package.json').version;
    const settings = this.props.settings;

    return (
      <div className="container-fluid main-container settings">
        <div className="row">
          <div className="col-xs-8">Show only participating</div>
          <div className="col-xs-4">
            <Toggle
              defaultChecked={settings.participating}
              onChange={this.toggleSetting.bind(this, 'participating')} />
          </div>
        </div>
        <div className="row">
          <div className="col-xs-8">Play sound</div>
          <div className="col-xs-4">
            <Toggle
              defaultChecked={settings.playSound}
              onChange={this.toggleSetting.bind(this, 'playSound')} />
          </div>
        </div>
        <div className="row">
          <div className="col-xs-8">Show notifications</div>
          <div className="col-xs-4">
            <Toggle
              defaultChecked={settings.showNotifications}
              onChange={this.toggleSetting.bind(this, 'showNotifications')} />
          </div>
        </div>

        <div className="row">
          <div className="col-xs-8">On Click, Mark as Read</div>
          <div className="col-xs-4">
            <Toggle
              defaultChecked={settings.markOnClick}
              onChange={this.toggleSetting.bind(this, 'markOnClick')} />
          </div>
        </div>

        <div className="row">
          <div className="col-xs-8">Open at startup</div>
          <div className="col-xs-4">
            <Toggle
              defaultChecked={settings.openAtStartup}
              onChange={this.toggleSetting.bind(this, 'openAtStartup')} />
          </div>
        </div>
        <div className="row">
          <div className="col-xs-6">
            <button
              className="btn btn-block btn-primary btn-close"
              onClick={this.checkForUpdates}>
              <i className="fa fa-cloud-download" />
              Update
            </button>
          </div>
          <div className="col-xs-6">
            <button
              className="btn btn-block btn-danger btn-close"
              onClick={this.appQuit}>
              <i className="fa fa-power-off" />
              Quit Gitify
            </button>
          </div>
        </div>

        <div className="row footer">
          <div className="col-xs-12 text-right">Gitify - Version: {appVersion}</div>
        </div>
      </div>
    );
  }
};


function mapStateToProps(state) {
  return {
    settings: state.settings
  };
};

export default connect(mapStateToProps, { updateSetting })(SettingsPage);
