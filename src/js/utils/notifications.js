export default {
  setup(notifications, settings) {
    // If there are no new notifications just stop there
    if (!notifications) { return; }

    if (settings.playSound) {
      this.raiseSoundNotification(notifications);
    }

    if (settings.showNotifications) {
      this.raiseNativeNotification(notifications);
    }
  },

  raiseNativeNotification(notifications) {
    console.log('raiseNativeNotification');
  },

  raiseSoundNotification(notifications) {
    console.log('raiseSoundNotification');
  }
};
