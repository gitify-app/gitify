import React from 'react';
import Toggle from 'react-toggle';

const ipcRenderer = window.require('electron').ipcRenderer;

var Actions = require('../actions/actions');
var SettingsStore = require('../stores/settings');

var SettingsPage = React.createClass({
  getInitialState: function () {
    var settings = SettingsStore.getSettings();
    return {
      participating: settings.participating,
      playSound: settings.playSound,
      showNotifications: settings.showNotifications,
      markOnClick: settings.markOnClick,
      openAtStartup: settings.openAtStartup
    };
  },

  toggleSetting: function (key, event) {
    console.log('!!!>!>!>!>>!>!>');
    console.log(event.target.checked);
    console.log('!!!>!>!>!>>!>!>');
    Actions.setSetting(key, event.target.checked);
  },

  checkForUpdates: function () {
    ipcRenderer.send('check-update');
  },

  appQuit: function () {
    ipcRenderer.send('app-quit');
  },

  render: function () {
    return (
      <div className="container-fluid main-container settings">
        <div className='row'>
          <div className='col-xs-8'>Show only participating</div>
          <div className='col-xs-4'>
            <Toggle
              defaultChecked={this.state.participating}
              onChange={this.toggleSetting.bind(this, 'participating')} />
          </div>
        </div>
        <div className='row'>
          <div className='col-xs-8'>Play sound</div>
          <div className='col-xs-4'>
            <Toggle
              defaultChecked={this.state.playSound}
              onChange={this.toggleSetting.bind(this, 'playSound')} />
          </div>
        </div>
        <div className='row'>
          <div className='col-xs-8'>Show notifications</div>
          <div className='col-xs-4'>
            <Toggle
              defaultChecked={this.state.showNotifications}
              onChange={this.toggleSetting.bind(this, 'showNotifications')} />
          </div>
        </div>

        <div className='row'>
          <div className='col-xs-8'>On Click, Mark as Read</div>
          <div className='col-xs-4'>
            <Toggle
              defaultChecked={this.state.markOnClick}
              onChange={this.toggleSetting.bind(this, 'markOnClick')} />
          </div>
        </div>

        <div className='row'>
          <div className='col-xs-8'>Open at startup</div>
          <div className='col-xs-4'>
            <Toggle
              defaultChecked={this.state.openAtStartup}
              onChange={this.toggleSetting.bind(this, 'openAtStartup')} />
          </div>
        </div>
        <div className='row'>
          <div className='col-xs-6'>
            <button
              className='btn btn-block btn-primary btn-close'
              onClick={this.checkForUpdates}>
              <i className="fa fa-cloud-download" />
              Update
            </button>
          </div>
          <div className='col-xs-6'>
            <button
              className='btn btn-block btn-danger btn-close'
              onClick={this.appQuit}>
              <i className="fa fa-power-off" />
              Quit Gitify
            </button>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = SettingsPage;
