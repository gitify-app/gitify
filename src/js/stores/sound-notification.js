import Reflux from 'reflux';
import _ from 'underscore';

const ipcRenderer = window.require('electron').ipcRenderer;

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

  newNotification: function (title, body, icon) {
    console.log(title, body);
    var nativeNotification = new Notification(title, {
      body: body,
      icon: icon || false
    });
    nativeNotification.onclick = function () {
      ipcRenderer.send('reopen-window');
    };
    return nativeNotification;
  },

  showNotification: function (countNew, response, latestNotification) {
    console.log(JSON.stringify(latestNotification));
    var title = (countNew == 1 ?
      'Gitify - ' + latestNotification.full_name :
      'Gitify');
    var body = (countNew == 1 ?
      latestNotification.subject :
      'You\'ve got ' + countNew + ' notifications.');
    var icon;
    if (countNew == 1) {
      switch (latestNotification.type) {
      case 'Issue':
        icon = 'images/notifications/issue.png';
        break;
      case 'Commit':
        icon = 'images/notifications/commit.png';
        break;
      case 'PullRequest':
        icon = 'images/notifications/pull-request.png';
        break;
      default:
        icon = 'images/notifications/gitify.png';
      }
    }
    this.newNotification(title, body, icon);
  },

  onIsNewNotification: function (response) {
    var self = this;
    var playSound = SettingsStore.getSettings().playSound;
    var showNotifications = SettingsStore.getSettings().showNotifications;

    if (!playSound && !showNotifications) { return; }

    // Check if notification is already in the store.
    var newNotifications = _.filter(response, function (obj) {
      return !_.contains(self._previousNotifications, obj.id);
    });

    // Play Sound / Show Notification.
    if (newNotifications && newNotifications.length) {
      if (playSound) {
        self.playSound();
      }
      if (showNotifications) {
        this.showNotification(newNotifications.length, response, {
          full_name: newNotifications[0].repository.full_name,
          subject: newNotifications[0].subject.title,
          type: newNotifications[0].subject.type
        });
      }
    }

    // Now Reset the previousNotifications array.
    self._previousNotifications = _.map(response, function (obj) {
      return obj.id;
    });
  }

});

module.exports = SoundNotificationStore;
