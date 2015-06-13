var ipc = window.require('ipc');
var Reflux = require('reflux');
var _ = require('underscore');

var Actions = require('../actions/actions');
var SettingsStore = require('../stores/settings');

var SoundNotificationStore = Reflux.createStore({
  listenables: Actions,

  init: function () {
    this._previousNotifications = [];
  },

  playSound: function () {
    var audio = new Audio('sounds/digi.wav');
    audio.play();
  },

  showNotification: function (countNew, response, latestNotification) {
    var title = (countNew == 1 ?
      'Gitify - ' + latestNotification.full_name :
      'Gitify');
    var body = (countNew == 1 ?
      latestNotification.subject :
      'You\'ve got ' + countNew + ' notifications.');
    var nativeNotification = new Notification(title, {
      body: body
    });
    nativeNotification.onclick = function () {
      ipc.sendChannel('reopen-window');
    };
  },

  onIsNewNotification: function (response) {
    var self = this;
    var playSound = SettingsStore.getSettings().playSound;
    var showNotifications = SettingsStore.getSettings().showNotifications;

    if (!playSound && !showNotifications) { return; }

    // Check if notification is already in the store.
    var countNew = 0;
    var latestNotification = {};
    _.map(response, function (obj) {
      if (!_.contains(self._previousNotifications, obj.id)) {
        countNew ++;
        latestNotification = {
          full_name: obj.repository.full_name,
          subject: obj.subject.title
        };
      }
    });

    // Play Sound / Show Notification.
    if (countNew > 0) {
      if (playSound) {
        self.playSound();
      }
      if (showNotifications) {
        self.showNotification(countNew, response, latestNotification);
      }
    }

    // Now Reset the previousNotifications array.
    self._previousNotifications = [];
    _.map(response, function (obj) {
      self._previousNotifications.push(obj.id);
    });
  }

});

module.exports = SoundNotificationStore;
