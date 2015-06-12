var React = require('react');
var Toggle = require('react-toggle');

var ipc = window.require('ipc');

var Actions = require('../actions/actions');
var SettingsStore = require('../stores/settings');

var SettingsPage = React.createClass({
  getInitialState: function () {
    return {
      participating: SettingsStore.getSettings().participating
    };
  },

  toggleParticipating: function (event) {
    Actions.setSetting('participating', event.target.checked);
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
              onChange={this.toggleParticipating} />
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
