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

  updateTrayIcon: function (notifications) {
    if (notifications.length > 0) {
      ipc.sendChannel('update-icon', "IconGreen");
    } else {
      ipc.sendChannel('update-icon', "IconPlain");
    }
  },

  onGetNotifications: function () {
    var self = this;
    var tokens = AuthStore.authStatus();

    apiRequests
      .getAuth('https://api.github.com/notifications')
      .end(function (err, response) {
        if (response && response.ok) {
          // Success - Do Something.
          Actions.getNotifications.completed(response.body);
          self.updateTrayIcon(response.body);
        } else {
          // Error - Show messages.
          Actions.getNotifications.failed(err);
        }
      });
  },

  onGetNotificationsCompleted: function (notifications) {
    var groupedNotifications = _.groupBy(notifications, function(object){
      return object.repository.name;
    });

    this._notifications = groupedNotifications;
    this.trigger(groupedNotifications);
  },

  onGetNotificationsFailed: function (error) {
    console.log("Errored." + error);
  }

});

module.exports = NotificationsStore;
