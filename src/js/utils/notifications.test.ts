import * as _ from 'lodash';

import { generateGitHubWebUrl } from '../../utils/helpers';
import { mockedGithubNotifications } from '../__mocks__/mockedData';
import * as comms from './comms';
import NotificationsUtils from '../utils/notifications';
import { SettingsState } from '../../types';

describe('utils/notifications.ts', () => {
  it('should raise a notification (settings - on)', () => {
    const settings = {
      playSound: true,
      showNotifications: true,
    } as SettingsState;

    spyOn(NotificationsUtils, 'raiseNativeNotification');
    spyOn(NotificationsUtils, 'raiseSoundNotification');

    NotificationsUtils.setup(
      mockedGithubNotifications,
      mockedGithubNotifications.length,
      settings
    );

    expect(NotificationsUtils.raiseNativeNotification).toHaveBeenCalledTimes(1);
    expect(NotificationsUtils.raiseSoundNotification).toHaveBeenCalledTimes(1);
  });

  it('should not raise a notification (settings - off)', () => {
    const settings = {
      playSound: false,
      showNotifications: false,
    } as SettingsState;

    spyOn(NotificationsUtils, 'raiseNativeNotification');
    spyOn(NotificationsUtils, 'raiseSoundNotification');

    NotificationsUtils.setup(
      mockedGithubNotifications,
      mockedGithubNotifications.length,
      settings
    );

    expect(NotificationsUtils.raiseNativeNotification).not.toHaveBeenCalled();
    expect(NotificationsUtils.raiseSoundNotification).not.toHaveBeenCalled();
  });

  it('should not raise a notification (because of 0(zero) notifications)', () => {
    const settings = {
      playSound: true,
      showNotifications: true,
    } as SettingsState;

    spyOn(NotificationsUtils, 'raiseNativeNotification');
    spyOn(NotificationsUtils, 'raiseSoundNotification');

    NotificationsUtils.setup([], 0, settings);

    expect(NotificationsUtils.raiseNativeNotification).not.toHaveBeenCalled();
    expect(NotificationsUtils.raiseSoundNotification).not.toHaveBeenCalled();
  });

  it('should raise a single native notification (with different icons)', () => {
    const settings = {
      playSound: false,
      showNotifications: true,
    } as SettingsState;

    const mockedNotification = mockedGithubNotifications[0];

    spyOn(NotificationsUtils, 'raiseNativeNotification');
    spyOn(NotificationsUtils, 'raiseSoundNotification');

    NotificationsUtils.setup([mockedNotification], 1, settings);

    expect(NotificationsUtils.raiseNativeNotification).toHaveBeenCalledTimes(1);
    expect(NotificationsUtils.raiseSoundNotification).not.toHaveBeenCalled();

    // @ts-ignore
    NotificationsUtils.raiseNativeNotification.calls.reset();

    // PullRequest
    NotificationsUtils.setup(
      _.updateWith(
        [mockedNotification],
        `[0][subject][type]`,
        () => 'PullRequest'
      ),
      1,
      settings
    );
    expect(NotificationsUtils.raiseNativeNotification).toHaveBeenCalledTimes(1);
  });

  it('should click on a native notification (with 1 notification)', () => {
    spyOn(comms, 'openExternalLink');

    const mockedNotifications = [[mockedGithubNotifications[0]]];

    const nativeNotification: Notification = NotificationsUtils.raiseNativeNotification(
      mockedNotifications,
      1
    );
    nativeNotification.onclick(null);

    const newUrl = generateGitHubWebUrl(
      mockedGithubNotifications[0].subject.url
    );
    expect(comms.openExternalLink).toHaveBeenCalledTimes(1);
    expect(comms.openExternalLink).toHaveBeenCalledWith(newUrl);
  });

  it('should click on a native notification (with more than 1 notification)', () => {
    spyOn(comms, 'reOpenWindow');

    const mockedNotifications = [mockedGithubNotifications];
    const count = mockedGithubNotifications.length;

    const nativeNotification = NotificationsUtils.raiseNativeNotification(
      mockedNotifications,
      count
    );
    nativeNotification.onclick(null);

    expect(comms.reOpenWindow).toHaveBeenCalledTimes(1);
  });

  it('should play a sound', () => {
    spyOn(window.Audio.prototype, 'play');
    NotificationsUtils.raiseSoundNotification();
    expect(window.Audio.prototype.play).toHaveBeenCalledTimes(1);
  });
});
