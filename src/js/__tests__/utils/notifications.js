import { Map } from 'immutable';
import NotificationsUtils, { getNotificationIcon } from '../../utils/notifications';
import Helpers from '../../utils/helpers';
import * as comms from '../../utils/comms';

describe('utils/notifications.js', () => {
  it('should raise a notification', () => {
    const settings = Map({
      playSound: true,
      showNotifications: true
    });

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

    spyOn(NotificationsUtils, 'raiseNativeNotification');
    spyOn(NotificationsUtils, 'raiseSoundNotification');

    NotificationsUtils.setup(notifications, settings);

    expect(NotificationsUtils.raiseNativeNotification).toHaveBeenCalledTimes(1);
    expect(NotificationsUtils.raiseSoundNotification).toHaveBeenCalledTimes(1);
  });

  it('should not raise a notification (because of settings)', () => {
    const settings = Map({
      playSound: false,
      showNotifications: false
    });

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

    spyOn(NotificationsUtils, 'raiseNativeNotification');
    spyOn(NotificationsUtils, 'raiseSoundNotification');

    NotificationsUtils.setup(notifications, settings);

    expect(NotificationsUtils.raiseNativeNotification).not.toHaveBeenCalled();
    expect(NotificationsUtils.raiseSoundNotification).not.toHaveBeenCalled();
  });

  it('should not raise a notification (because of 0(zero) notifications)', () => {
    const settings = {
      playSound: true,
      showNotifications: true
    };

    const notifications = [];

    spyOn(NotificationsUtils, 'raiseNativeNotification');
    spyOn(NotificationsUtils, 'raiseSoundNotification');

    NotificationsUtils.setup(notifications, settings);

    expect(NotificationsUtils.raiseNativeNotification).not.toHaveBeenCalled();
    expect(NotificationsUtils.raiseSoundNotification).not.toHaveBeenCalled();
  });

  it('should raise a single native notification (with different icons)', () => {
    const settings = Map({
      playSound: false,
      showNotifications: true
    });

    const notification = {
      subject: {
        title: 'Hello. This is a notification',
        type: 'Issue'
      },
      repository: {
        full_name: 'ekonstantinidis/gitify'
      }
    };

    spyOn(NotificationsUtils, 'raiseNativeNotification');
    spyOn(NotificationsUtils, 'raiseSoundNotification');

    NotificationsUtils.setup([notification], settings);

    expect(NotificationsUtils.raiseNativeNotification).toHaveBeenCalledTimes(1);
    expect(NotificationsUtils.raiseSoundNotification).not.toHaveBeenCalled();

    NotificationsUtils.raiseNativeNotification.calls.reset();

    // PullRequest
    NotificationsUtils.setup([{
      ...notification,
      subject: {
        ...notification.subject,
        type: 'PullRequest'
      }
    }], settings);
    expect(NotificationsUtils.raiseNativeNotification).toHaveBeenCalledTimes(1);
    NotificationsUtils.raiseNativeNotification.calls.reset();

    // Commit
    NotificationsUtils.setup([{
      ...notification,
      subject: {
        ...notification.subject,
        type: 'Commit'
      }
    }], settings);
    expect(NotificationsUtils.raiseNativeNotification).toHaveBeenCalledTimes(1);
    NotificationsUtils.raiseNativeNotification.calls.reset();

    // Commit
    NotificationsUtils.setup([{
      ...notification,
      subject: {
        ...notification.subject,
        type: 'Release'
      }
    }], settings);
    expect(NotificationsUtils.raiseNativeNotification).toHaveBeenCalledTimes(1);
    NotificationsUtils.raiseNativeNotification.calls.reset();

    // AnotherType
    NotificationsUtils.setup([{
      ...notification,
      subject: {
        ...notification.subject,
        type: 'AnotherType'
      }
    }], settings);
    expect(NotificationsUtils.raiseNativeNotification).toHaveBeenCalledTimes(1);
    NotificationsUtils.raiseNativeNotification.calls.reset();
  });

  it('should click on a native notification (with 1 notification)', () => {
    const notification = {
      subject: {
        title: 'Hello. This is a notification',
        type: 'Issue',
        url: 'https://api.github.com/repos/ekonstantinidis/notifications-test/issues/3'
      },
      repository: {
        full_name: 'ekonstantinidis/gitify'
      }
    };

    spyOn(comms, 'openExternalLink');

    const nativeNotification = NotificationsUtils.raiseNativeNotification(false, [notification]);
    nativeNotification.onclick();

    const newUrl = Helpers.generateGitHubUrl(false, notification.subject.url);
    expect(comms.openExternalLink).toHaveBeenCalledTimes(1);
    expect(comms.openExternalLink).toHaveBeenCalledWith(newUrl);
  });

  it('should click on a native notification (with more than 1 notification)', () => {
    const notifications = [
      {
        subject: {
          title: 'Hello. This is a notification',
          type: 'Issue',
          url: 'https://api.github.com/repos/ekonstantinidis/notifications-test/issues/3'
        },
        repository: {
          full_name: 'ekonstantinidis/gitify'
        }
      },
      {
        subject: {
          title: 'Hello. This is another notification',
          type: 'Issue',
          url: 'https://api.github.com/repos/ekonstantinidis/notifications-test/issues/3'
        },
        repository: {
          full_name: 'ekonstantinidis/gitify'
        }
      },
    ];

    spyOn(comms, 'reOpenWindow');

    const nativeNotification = NotificationsUtils.raiseNativeNotification(false, notifications);
    nativeNotification.onclick();

    expect(comms.reOpenWindow).toHaveBeenCalledTimes(1);
  });

  it('should use different notification icons', () => {
    expect(getNotificationIcon('Issue')).toEqual('images/notifications/issue.png');
    expect(getNotificationIcon('Commit')).toEqual('images/notifications/commit.png');
    expect(getNotificationIcon('PullRequest')).toEqual('images/notifications/pull-request.png');
    expect(getNotificationIcon('Release')).toEqual('images/notifications/release.png');
    expect(getNotificationIcon('WHATEVER')).toEqual('images/notifications/gitify.png');
  });

  it('should play a sound', () => {
    spyOn(window.Audio.prototype, 'play');
    NotificationsUtils.raiseSoundNotification();
    expect(window.Audio.prototype.play).toHaveBeenCalledTimes(1);
  });
});
