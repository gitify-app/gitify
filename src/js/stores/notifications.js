import _ from 'underscore';

export default {
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
