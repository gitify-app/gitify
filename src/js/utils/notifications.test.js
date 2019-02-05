import { List, Map } from 'immutable';

import * as comms from './comms';
import { mockedGithubNotifications } from './../__mocks__/mockedData';
import NotificationsUtils, { getNotificationIcon } from './notifications';
import { generateGitHubWebUrl } from './helpers';

describe('utils/notifications.js', () => {
  it('should raise a notification (settings - on)', () => {
    const settings = Map({
      playSound: true,
      showNotifications: true,
    });

    spyOn(NotificationsUtils, 'raiseNativeNotification');
    spyOn(NotificationsUtils, 'raiseSoundNotification');

    NotificationsUtils.setup(
      mockedGithubNotifications,
      mockedGithubNotifications.size,
      settings
    );

    expect(NotificationsUtils.raiseNativeNotification).toHaveBeenCalledTimes(1);
    expect(NotificationsUtils.raiseSoundNotification).toHaveBeenCalledTimes(1);
  });

  it('should not raise a notification (settings - off)', () => {
    const settings = Map({
      playSound: false,
      showNotifications: false,
    });

    spyOn(NotificationsUtils, 'raiseNativeNotification');
    spyOn(NotificationsUtils, 'raiseSoundNotification');

    NotificationsUtils.setup(
      mockedGithubNotifications,
      mockedGithubNotifications.size,
      settings
    );

    expect(NotificationsUtils.raiseNativeNotification).not.toHaveBeenCalled();
    expect(NotificationsUtils.raiseSoundNotification).not.toHaveBeenCalled();
  });

  it('should not raise a notification (because of 0(zero) notifications)', () => {
    const settings = {
      playSound: true,
      showNotifications: true,
    };

    spyOn(NotificationsUtils, 'raiseNativeNotification');
    spyOn(NotificationsUtils, 'raiseSoundNotification');

    NotificationsUtils.setup(List(), 0, settings);

    expect(NotificationsUtils.raiseNativeNotification).not.toHaveBeenCalled();
    expect(NotificationsUtils.raiseSoundNotification).not.toHaveBeenCalled();
  });

  it('should raise a single native notification (with different icons)', () => {
    const settings = Map({
      playSound: false,
      showNotifications: true,
    });

    const mockedNotification = mockedGithubNotifications.first();

    spyOn(NotificationsUtils, 'raiseNativeNotification');
    spyOn(NotificationsUtils, 'raiseSoundNotification');

    NotificationsUtils.setup(List.of(mockedNotification), 1, settings);

    expect(NotificationsUtils.raiseNativeNotification).toHaveBeenCalledTimes(1);
    expect(NotificationsUtils.raiseSoundNotification).not.toHaveBeenCalled();

    NotificationsUtils.raiseNativeNotification.calls.reset();

    // PullRequest
    NotificationsUtils.setup(
      List.of(mockedNotification.setIn(['subject', 'type'], 'PullRequest')),
      1,
      settings
    );
    expect(NotificationsUtils.raiseNativeNotification).toHaveBeenCalledTimes(1);
    NotificationsUtils.raiseNativeNotification.calls.reset();

    // Commit
    NotificationsUtils.setup(
      List.of(mockedNotification.setIn(['subject', 'type'], 'Commit')),
      1,
      settings
    );
    expect(NotificationsUtils.raiseNativeNotification).toHaveBeenCalledTimes(1);
    NotificationsUtils.raiseNativeNotification.calls.reset();

    // Commit
    NotificationsUtils.setup(
      List.of(mockedNotification.setIn(['subject', 'type'], 'Release')),
      1,
      settings
    );
    expect(NotificationsUtils.raiseNativeNotification).toHaveBeenCalledTimes(1);
    NotificationsUtils.raiseNativeNotification.calls.reset();

    // AnotherType
    NotificationsUtils.setup(
      List.of(mockedNotification.setIn(['subject', 'type'], 'AnotherType')),
      1,
      settings
    );
    expect(NotificationsUtils.raiseNativeNotification).toHaveBeenCalledTimes(1);
    NotificationsUtils.raiseNativeNotification.calls.reset();
  });

  it('should click on a native notification (with 1 notification)', () => {
    spyOn(comms, 'openExternalLink');

    const mockedNotifications = List.of(
      List.of(mockedGithubNotifications.first())
    );

    const nativeNotification = NotificationsUtils.raiseNativeNotification(
      mockedNotifications,
      1
    );
    nativeNotification.onclick();

    const newUrl = generateGitHubWebUrl(
      mockedGithubNotifications.getIn([0, 'subject', 'url'])
    );
    expect(comms.openExternalLink).toHaveBeenCalledTimes(1);
    expect(comms.openExternalLink).toHaveBeenCalledWith(newUrl);
  });

  it('should click on a native notification (with more than 1 notification)', () => {
    spyOn(comms, 'reOpenWindow');

    const mockedNotifications = List.of(mockedGithubNotifications);
    const count = mockedGithubNotifications.size;

    const nativeNotification = NotificationsUtils.raiseNativeNotification(
      mockedNotifications,
      count
    );
    nativeNotification.onclick();

    expect(comms.reOpenWindow).toHaveBeenCalledTimes(1);
  });

  it('should use different notification icons', () => {
    expect(getNotificationIcon('Issue')).toEqual(
      'images/notifications/issue.png'
    );
    expect(getNotificationIcon('Commit')).toEqual(
      'images/notifications/commit.png'
    );
    expect(getNotificationIcon('PullRequest')).toEqual(
      'images/notifications/pull-request.png'
    );
    expect(getNotificationIcon('Release')).toEqual(
      'images/notifications/release.png'
    );
    expect(getNotificationIcon('WHATEVER')).toEqual(
      'images/notifications/gitify.png'
    );
  });

  it('should play a sound', () => {
    spyOn(window.Audio.prototype, 'play');
    NotificationsUtils.raiseSoundNotification();
    expect(window.Audio.prototype.play).toHaveBeenCalledTimes(1);
  });
});
