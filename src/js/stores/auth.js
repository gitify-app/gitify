var Reflux = require('reflux');
var Actions = require('../actions/actions');

var AuthStore = Reflux.createStore({
  listenables: Actions,

  init: function () {
    this._githubtoken = window.localStorage.getItem('githubtoken') || false;
  },

  onLogin: function (token) {
    this._githubtoken = token;
    window.localStorage.setItem('githubtoken', token);
    this.trigger(this.authStatus());
  },

  onLogout: function () {
    window.localStorage.clear();
    this._githubtoken = false;
    this.trigger(this.authStatus());
  },

  authStatus: function () {
    var self = this;
    return self._githubtoken;
  }
});

module.exports = AuthStore;
