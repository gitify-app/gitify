var ipc = window.require('ipc');
var _ = require('underscore');

var Reflux = require('reflux');
var Actions = require('../actions/actions');
var apiRequests = require('../utils/api-requests');
var SettingsStore = require('../stores/settings');

require('../stores/sound-notification');

var NotificationsStore = Reflux.createStore({
  listenables: Actions,

  init: function () {
    this._notifications = [];
  },

  updateTrayIcon: function (notifications) {
    if (notifications.length > 0) {
      ipc.sendChannel('update-icon', 'TrayActive');
    } else {
      ipc.sendChannel('update-icon', 'TrayIdle');
    }
  },

  onGetNotifications: function () {
    var self = this;
    var participating = SettingsStore.getSettings().participating;

    apiRequests
      .getAuth('https://api.github.com/notifications?participating=' +
        (participating ? 'true' : 'false'))
      .end(function (err, response) {
        if (response && response.ok) {
          // Success - Do Something.
          Actions.getNotifications.completed(response.body);
          self.updateTrayIcon(response.body);
          Actions.isNewNotification(response.body);
        } else {
          // Error - Show messages.
          Actions.getNotifications.failed(err);
        }
      });
  },

  onGetNotificationsCompleted: function (notifications) {
    this._notifications = notifications;
    this.trigger(this._notifications);
  },

  onGetNotificationsFailed: function () {
    this._notifications = [];
    this.trigger(this._notifications);
  },

  onRemoveNotification: function (notification) {

    var self = this;

    console.log(this._notifications.length);
    this._notifications = _.without(this._notifications, notification);
    console.log(this._notifications.length);

    // this.trigger(this._notifications);

    setTimeout(function () {
      self.trigger(this._notifications);
    }, 800);

  }

});

module.exports = NotificationsStore;
