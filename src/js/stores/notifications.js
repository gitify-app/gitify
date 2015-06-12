var ipc = window.require('ipc');
var _ = require('underscore');

var Reflux = require('reflux');
var Actions = require('../actions/actions');
var apiRequests = require('../utils/api-requests');
var SettingsStore = require('../stores/settings');

var NotificationsStore = Reflux.createStore({
  listenables: Actions,

  init: function () {
    this._notifications = [];
    this._previousNotifications = [];
  },

  updateTrayIcon: function (notifications) {
    if (notifications.length > 0) {
      ipc.sendChannel('update-icon', 'TrayActive');
    } else {
      ipc.sendChannel('update-icon', 'TrayIdle');
    }
  },

  isNewNotification: function (response) {
    var self = this;
    var playSound = SettingsStore.getSettings().playSound;
    var showNotifications = SettingsStore.getSettings().showNotifications;

    if (!playSound && !showNotifications) { return; }

    // Check if notification is already in the store.
    var countNew = 0;
    _.map(response, function (obj) {
      if (!_.contains(self._previousNotifications, obj.id)) {
        countNew ++;
      }
    });

    // Play Sound.
    if (countNew > 0) {
      if (playSound) {
        var audio = new Audio('sounds/digi.wav');
        audio.play();
      }
      if (showNotifications) {
        var body = (countNew == 1 ?
          'You\'ve got a new notification' :
          'You\'ve got ' + countNew + ' notifications.');
        var nativeNotification = new Notification('Gitify', {
          body: body
        });
        nativeNotification.onclick = function () {
          ipc.sendChannel('reopen-window');
        };
      }
    }

    // Now Reset the previousNotifications array.
    self._previousNotifications = [];
    _.map(response, function (obj) {
      self._previousNotifications.push(obj.id);
    });
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
          self.isNewNotification(response.body);
        } else {
          // Error - Show messages.
          Actions.getNotifications.failed(err);
        }
      });
  },

  onGetNotificationsCompleted: function (notifications) {
    var groupedNotifications = _.groupBy(notifications, function (object) {
      return object.repository.full_name;
    });

    var array = [];
    _.map(groupedNotifications, function (obj) {
      array.push(obj);
    });

    this._notifications = array;
    this.trigger(this._notifications);
  },

  onGetNotificationsFailed: function () {
    this._notifications = [];
    this.trigger(this._notifications);
  }

});

module.exports = NotificationsStore;
