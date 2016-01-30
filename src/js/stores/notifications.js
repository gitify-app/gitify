import Reflux from 'reflux';
import _ from 'underscore';

var config = require('../config');

const ipcRenderer = window.require('electron').ipcRenderer;

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
      ipcRenderer.send('update-icon', 'TrayActive');
    } else {
      ipcRenderer.send('update-icon', 'TrayIdle');
    }
  },

  onGetNotifications: function () {
    var self = this;
    var participating = SettingsStore.getSettings().participating;

    apiRequests
      .getAuth(config.apiUrl() + '/notifications?participating=' +
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

    this._notifications = _.without(this._notifications, notification);

    setTimeout(function () {
      self.trigger(self._notifications);
      self.updateTrayIcon(self._notifications);
    }, 800);
  },

  onRemoveRepoNotifications: function (repoFullName) {
    var self = this;

    this._notifications = _.reject(this._notifications, function (obj) {
      return obj.repository.full_name == repoFullName;
    });

    setTimeout(function () {
      self.trigger(self._notifications);
      self.updateTrayIcon(self._notifications);
    }, 800);
  }

});

module.exports = NotificationsStore;
