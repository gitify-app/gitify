var React = require('react');
var Toggle = require('react-toggle');

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
      </div>
    );
  }
});

module.exports = SettingsPage;
