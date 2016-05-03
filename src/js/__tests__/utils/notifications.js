import { expect } from 'chai';
import sinon from 'sinon';
import NotificationsUtils from '../../utils/notifications';
// const ipcRenderer = window.require('electron').ipcRenderer;


describe('utils/notifications.js', () => {

  beforeEach(function() {
    sinon.spy(NotificationsUtils, 'raiseNativeNotification');
    sinon.spy(NotificationsUtils, 'raiseSoundNotification');
  });

  afterEach(function () {
    NotificationsUtils.raiseNativeNotification.restore();
    NotificationsUtils.raiseSoundNotification.restore();
  });

  it('should raise a notification', () => {

    const settings = {
      playSound: true,
      showNotifications: true
    };

    const notifications = [
      {
        subject: {
          title: 'Hello. This is a notification',
          type: 'Issue'
        },
        repository: {
          full_name: 'ekonstantinidis/gitify'
        }
      }
    ];

    NotificationsUtils.setup(notifications, settings);
    expect(NotificationsUtils.raiseNativeNotification).to.have.been.calledOnce;
    expect(NotificationsUtils.raiseSoundNotification).to.have.been.calledOnce;

  });

  it('should not raise a notification (because of settings)', () => {

    const settings = {
      playSound: false,
      showNotifications: false
    };

    const notifications = [
      {
        subject: {
          title: 'Hello. This is a notification',
          type: 'Issue'
        },
        repository: {
          full_name: 'ekonstantinidis/gitify'
        }
      }
    ];

    NotificationsUtils.setup(notifications, settings);
    expect(NotificationsUtils.raiseNativeNotification).to.not.have.been.calledOnce;
    expect(NotificationsUtils.raiseSoundNotification).to.not.have.been.calledOnce;

  });

  it('should not raise a notification (because of 0(zero) notifications)', () => {

    const settings = {
      playSound: true,
      showNotifications: true
    };

    const notifications = [];

    NotificationsUtils.setup(notifications, settings);
    expect(NotificationsUtils.raiseNativeNotification).to.not.have.been.calledOnce;
    expect(NotificationsUtils.raiseSoundNotification).to.not.have.been.calledOnce;

  });

});
