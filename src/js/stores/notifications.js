var ipc = window.require('ipc');
var _ = require('underscore');

var Reflux = require('reflux');
var Actions = require('../actions/actions');
var AuthStore = require('../stores/auth');
var apiRequests = require('../utils/api-requests');

var NotificationsStore = Reflux.createStore({
  listenables: Actions,

  init: function () {
    this._notifications = [];
  },

  updateTrayIcon: function (notifications) {
    if (notifications.length > 0) {
      ipc.sendChannel('update-icon', "TrayActive");
    } else {
      ipc.sendChannel('update-icon', "TrayIdle");
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
      return object.repository.full_name;
    });

    var array= [];
    _.map(groupedNotifications, function(obj, i) {
      array.push(obj);
    });

    this._notifications = array;
    this.trigger(this._notifications);
  },

  onGetNotificationsFailed: function (error) {
    console.log("Errored." + error);
  }

});

module.exports = NotificationsStore;
