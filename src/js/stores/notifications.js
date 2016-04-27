import _ from 'underscore';

export default {
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
};
