import { expect } from 'chai';
import sinon from 'sinon';
import NotificationsUtils from '../../utils/notifications';
import Helpers from '../../utils/helpers';

const ipcRenderer = window.require('electron').ipcRenderer;
const shell = window.require('electron').shell;


describe('utils/notifications.js', () => {

  beforeEach(function() {
    ipcRenderer.send.reset();
    shell.openExternal.reset();
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

    // PullRequest
    NotificationsUtils.setup([{
      ...notification,
      subject: {
        ...notification.subject,
        type: 'PullRequest'
      }
    }], settings);
    expect(NotificationsUtils.raiseNativeNotification).to.have.been.calledOnce;
    NotificationsUtils.raiseNativeNotification.reset();

    // Commit
    NotificationsUtils.setup([{
      ...notification,
      subject: {
        ...notification.subject,
        type: 'Commit'
      }
    }], settings);
    expect(NotificationsUtils.raiseNativeNotification).to.have.been.calledOnce;
    NotificationsUtils.raiseNativeNotification.reset();

    // Commit
    NotificationsUtils.setup([{
      ...notification,
      subject: {
        ...notification.subject,
        type: 'Release'
      }
    }], settings);
    expect(NotificationsUtils.raiseNativeNotification).to.have.been.calledOnce;
    NotificationsUtils.raiseNativeNotification.reset();

    // AnotherType
    NotificationsUtils.setup([{
      ...notification,
      subject: {
        ...notification.subject,
        type: 'AnotherType'
      }
    }], settings);
    expect(NotificationsUtils.raiseNativeNotification).to.have.been.calledOnce;
    NotificationsUtils.raiseNativeNotification.reset();

  });

  it('should click on a native notification (with 1 notification)', () => {

    const notification = {
      subject: {
        title: 'Hello. This is a notification',
        type: 'Issue',
        url: 'https://api.github.com/repos/ekonstantinidis/notifications-test/issues/3',
        latest_comment_url: 'https://api.github.com/repos/ekonstantinidis/notifications-test/issues/3'
      },
      repository: {
        full_name: 'ekonstantinidis/gitify'
      }
    };

    // Restore functionality so we can test further
    NotificationsUtils.raiseNativeNotification.restore();

    const nativeNotification = NotificationsUtils.raiseNativeNotification([notification]);
    nativeNotification.onclick();

    const newUrl = Helpers.generateGitHubUrl(notification.subject);
    expect(shell.openExternal).to.have.been.calledOnce;
    expect(shell.openExternal).to.have.been.calledWith(newUrl);

    // Put the spy back
    sinon.spy(NotificationsUtils, 'raiseNativeNotification');
  });

  it('should click on a native notification (with more than 1 notification)', () => {

    const notifications = [
      {
        subject: {
          title: 'Hello. This is a notification',
          type: 'Issue',
          url: 'https://api.github.com/repos/ekonstantinidis/notifications-test/issues/3',
          latest_comment_url: 'https://api.github.com/repos/ekonstantinidis/notifications-test/issues/3'
        },
        repository: {
          full_name: 'ekonstantinidis/gitify'
        }
      },
      {
        subject: {
          title: 'Hello. This is another notification',
          type: 'Issue',
          url: 'https://api.github.com/repos/ekonstantinidis/notifications-test/issues/3',
          latest_comment_url: 'https://api.github.com/repos/ekonstantinidis/notifications-test/issues/3'
        },
        repository: {
          full_name: 'ekonstantinidis/gitify'
        }
      },
    ];

    // Restore functionality so we can test further
    NotificationsUtils.raiseNativeNotification.restore();

    const nativeNotification = NotificationsUtils.raiseNativeNotification(notifications);
    nativeNotification.onclick();

    expect(ipcRenderer.send).to.have.been.calledOnce;
    expect(ipcRenderer.send).to.have.been.calledWith('reopen-window');

    // Put the spy back
    sinon.spy(NotificationsUtils, 'raiseNativeNotification');
  });
});
