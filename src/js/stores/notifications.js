var ipc = window.require('ipc');
var _ = require('underscore');

var Reflux = require('reflux');
var Actions = require('../actions/actions');
var AuthStore = require('../stores/auth');
var apiRequests = require('../utils/api-requests');

var NotificationsStore = Reflux.createStore({
  listenables: Actions,

  init: function () {
    this._notifications = undefined;
  },

  onGetNotifications: function () {
    var self = this;
    var tokens = AuthStore.authStatus();

    apiRequests
      .getAuth('https://api.github.com/notifications')
      .end(function (err, response) {
        if (response && response.ok) {
          // Success - Do Something.
          self._notifications = response.body;
          Actions.getNotifications.completed();
        } else {
          // Error - Show messages.
          console.log(err);
          Actions.getNotifications.failed();
        }
      });
  },

  onGetNotificationsCompleted: function () {
    this.trigger(this._notifications);
  }

});

module.exports = NotificationsStore;
