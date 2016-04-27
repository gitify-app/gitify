import _ from 'underscore';

var NotificationsStore = Reflux.createStore({
  listenables: Actions,

  init: function () {
    this._notifications = [];
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
      return obj.repository.full_name === repoFullName;
    });

    setTimeout(function () {
      self.trigger(self._notifications);
      self.updateTrayIcon(self._notifications);
    }, 800);
  }

});

module.exports = NotificationsStore;
