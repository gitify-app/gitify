import React from 'react';
import { connect } from 'react-redux';
import Toggle from 'react-toggle';

const ipcRenderer = window.require('electron').ipcRenderer;

import { fetchNotifications, updateSetting, logout } from '../actions';

export class SettingsPage extends React.Component {
  componentWillReceiveProps(nextProps) {
    if (nextProps.settings.participating !== this.props.settings.participating) {
      this.props.fetchNotifications();
    }
  }

  toggleSetting(key, event) {
    this.props.updateSetting(key, event.target.checked);
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
    const settings = this.props.settings;

    return (
      <div className="container-fluid main-container settings">
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
              defaultChecked={settings.participating}
              onChange={this.toggleSetting.bind(this, 'participating')} />
          </div>
        </div>
        <div className="row setting">
          <div className="col-xs-8">Play sound</div>
          <div className="col-xs-4">
            <Toggle
              defaultChecked={settings.playSound}
              onChange={this.toggleSetting.bind(this, 'playSound')} />
          </div>
        </div>
        <div className="row setting">
          <div className="col-xs-8">Show notifications</div>
          <div className="col-xs-4">
            <Toggle
              defaultChecked={settings.showNotifications}
              onChange={this.toggleSetting.bind(this, 'showNotifications')} />
          </div>
        </div>

        <div className="row setting">
          <div className="col-xs-8">On Click, Mark as Read</div>
          <div className="col-xs-4">
            <Toggle
              defaultChecked={settings.markOnClick}
              onChange={this.toggleSetting.bind(this, 'markOnClick')} />
          </div>
        </div>

        <div className="row setting">
          <div className="col-xs-8">Open at startup</div>
          <div className="col-xs-4">
            <Toggle
              defaultChecked={settings.openAtStartup}
              onChange={this.toggleSetting.bind(this, 'openAtStartup')} />
          </div>
        </div>

        <div className="row setting">
          <div className="col-xs-12">
            <a href="https://github.com/watching" target="_blank">
              Managed watched repositories
            </a>
          </div>
        </div>

        <div className="row footer">
          <div className="col-xs-6 text-left">Made with <span className="heart">❤</span> in Brighton.</div>
          <div className="col-xs-6 text-right">Gitify - Version: {appVersion}</div>
        </div>
      </div>
    );
  }
};

SettingsPage.contextTypes = {
  router: React.PropTypes.object.isRequired
};

function mapStateToProps(state) {
  return {
    settings: state.settings
  };
};

export default connect(mapStateToProps, {
  updateSetting,
  fetchNotifications,
  logout
})(SettingsPage);
