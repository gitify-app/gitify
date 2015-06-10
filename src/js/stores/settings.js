var Reflux = require('reflux');
var Actions = require('../actions/actions');

var SettingsStore = Reflux.createStore({
  listenables: Actions,

  init: function () {
    var settings = window.localStorage.getItem('settings');

    if (!settings) {
      settings = {
        'participating': false
      };
    }

    if (settings[0] === '{') {
      settings = JSON.parse(settings);
    }

    this._settings = settings;
  },

  getSettings: function () {
    return this._settings;
  },

  onSetSetting: function (setting, value) {
    console.log('Setting: ' + setting + ' to: ' + value);
    this._settings[setting] = value;
    window.localStorage.setItem('settings', JSON.stringify(this._settings));
    this.trigger(this._settings);
  }

});

module.exports = SettingsStore;
