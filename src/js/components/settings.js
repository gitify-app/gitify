var React = require('react');
var Reflux = require('reflux');
var Toggle = require('react-toggle');

var Actions = require('../actions/actions');
var SettingsStore = require('../stores/settings');

var SettingsPage = React.createClass({
  mixins: [
    Reflux.connect(SettingsStore, 'settings')
  ],

  getInitialState: function () {
    return {
      settings: Actions.getSettings()
    };
  },

  toggleParticipating: function () {
    Actions.setSetting('participating', !this.state.settings.participating);
  },

  render: function () {
    return (
      <div className="container-fluid main-container settings">
        <div className='row'>
          <div className='col-xs-8'>Show only participating</div>
          <div className='col-xs-4'>
            <Toggle
              defaultChecked={this.state.settings.participating}
              onChange={this.toggleParticipating} />
          </div>
        </div>
      </div>
    );
  }
});

module.exports = SettingsPage;
