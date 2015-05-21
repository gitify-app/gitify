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
    this.trigger(token);
  },

  onLogout: function () {
    console.log("LOGOUT");
    window.localStorage.clear();
    this._githubtoken = false;
    this.trigger(false);
  },

  authStatus: function () {
    return this._githubtoken;
  }
});

module.exports = AuthStore;
