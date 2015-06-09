var React = require('react');
var Reflux = require('reflux');

var SettingsStore = require('../stores/settings');

var SettingsPage = React.createClass({
  mixins: [
    Reflux.connect(SettingsStore, 'settings')
  ],

  getInitialState: function () {
    return {
      settings: undefined
    };
  },

  render: function () {
    return (
      <div className="container-fluid main-container settings">
        <div className='row'>
          <div className='col-xs-8'>Setting Title</div>
          <div className='col-xs-4'>Value</div>
        </div>
      </div>
    );
  }
});

module.exports = SettingsPage;
