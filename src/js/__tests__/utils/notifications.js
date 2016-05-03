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
      },
      {
        subject: {
          title: 'Hello. This is another notification',
          type: 'PullRequest'
        },
        repository: {
          full_name: 'ekonstantinidis/django-rest-framework-docs'
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

  it('should raise a single native notification (with different icons)', () => {

    const settings = {
      playSound: false,
      showNotifications: true
    };

    const notification = {
      subject: {
        title: 'Hello. This is a notification',
        type: 'Issue'
      },
      repository: {
        full_name: 'ekonstantinidis/gitify'
      }
    };

    NotificationsUtils.setup([notification], settings);
    expect(NotificationsUtils.raiseNativeNotification).to.have.been.calledOnce;
    expect(NotificationsUtils.raiseSoundNotification).to.not.have.been.calledOnce;

    NotificationsUtils.raiseNativeNotification.reset();

    NotificationsUtils.setup([{
      ...notification,
      subject: {
        ...notification.subject,
        type: 'PullRequest'
      }
    }], settings);

    expect(NotificationsUtils.raiseNativeNotification).to.have.been.calledOnce;
  });

});
