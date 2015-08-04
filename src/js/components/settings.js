var React = require('react');
var Toggle = require('react-toggle');

var ipc = window.require('ipc');

var Actions = require('../actions/actions');
var SettingsStore = require('../stores/settings');

var SettingsPage = React.createClass({
  getInitialState: function () {
    var settings = SettingsStore.getSettings();
    return {
      participating: settings.participating,
      playSound: settings.playSound,
      showNotifications: settings.showNotifications,
      openAtStartup: settings.openAtStartup
    };
  },

  toggleSetting: function (key, event) {
    Actions.setSetting(key, event.target.checked);
  },

  appQuit: function () {
    ipc.sendChannel('app-quit');
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
          <div className='col-xs-8'>Open at startup</div>
          <div className='col-xs-4'>
            <Toggle
              defaultChecked={this.state.openAtStartup}
              onChange={this.toggleSetting.bind(this, 'openAtStartup')} />
          </div>
        </div>
        <div className='row'>
          <button
            className='btn btn-block btn-danger btn-close'
            onClick={this.appQuit}>
            <i className="fa fa-power-off" />
            Quit Gitify
          </button>
        </div>
      </div>
    );
  }
});

module.exports = SettingsPage;
