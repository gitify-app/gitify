var Reflux = require('reflux');
var Actions = require('../actions/actions');

var SettingsStore = Reflux.createStore({
  listenables: Actions,

  init: function () {
    var settings = window.localStorage.getItem('settings') || {
      participating: false
    };
    var participatingSetting = settings.participating || false;
    this._settings = {
      participating: participatingSetting
    };
  },

  onGetSettings: function () {
    return this._settings;
  },

  onSetSetting: function (setting, value) {
    console.log('Setting: ' + setting + ' to: ' + value);
  }

});

module.exports = SettingsStore;
