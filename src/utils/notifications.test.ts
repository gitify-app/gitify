import * as _ from 'lodash';

import { generateGitHubWebUrl, getCommentId } from './helpers';
import {
  mockedAccountNotifications,
  mockedGithubNotifications,
  mockedSingleAccountNotifications,
  mockedUser,
} from '../__mocks__/mockedData';
import { mockAccounts } from '../__mocks__/mock-state';
import * as comms from './comms';
import * as notificationsHelpers from './notifications';
import { SettingsState } from '../types';
import { defaultSettings } from '../context/App';

describe('utils/notifications.ts', () => {
  it('should raise a notification (settings - on)', () => {
    const settings: SettingsState = {
      ...defaultSettings,
      playSound: true,
      showNotifications: true,
    };

    jest.spyOn(notificationsHelpers, 'raiseNativeNotification');
    jest.spyOn(notificationsHelpers, 'raiseSoundNotification');

    notificationsHelpers.triggerNativeNotifications(
      [],
      mockedAccountNotifications,
      settings,
      mockAccounts
    );

    expect(notificationsHelpers.raiseNativeNotification).toHaveBeenCalledTimes(
      1
    );
    expect(notificationsHelpers.raiseSoundNotification).toHaveBeenCalledTimes(
      1
    );
  });

  it('should not raise a notification (settings - off)', () => {
    const settings = {
      ...defaultSettings,
      playSound: false,
      showNotifications: false,
    };

    spyOn(notificationsHelpers, 'raiseNativeNotification');
    spyOn(notificationsHelpers, 'raiseSoundNotification');

    notificationsHelpers.triggerNativeNotifications(
      [],
      mockedAccountNotifications,
      settings,
      mockAccounts
    );

    expect(notificationsHelpers.raiseNativeNotification).not.toHaveBeenCalled();
    expect(notificationsHelpers.raiseSoundNotification).not.toHaveBeenCalled();
  });

  it('should not raise a notification or play a sound (no new notifications)', () => {
    const settings = {
      ...defaultSettings,
      playSound: true,
      showNotifications: true,
    };

    spyOn(notificationsHelpers, 'raiseNativeNotification');
    spyOn(notificationsHelpers, 'raiseSoundNotification');

    notificationsHelpers.triggerNativeNotifications(
      mockedSingleAccountNotifications,
      mockedSingleAccountNotifications,
      settings,
      mockAccounts
    );

    expect(notificationsHelpers.raiseNativeNotification).not.toHaveBeenCalled();
    expect(notificationsHelpers.raiseSoundNotification).not.toHaveBeenCalled();
  });

  it('should not raise a notification (because of 0(zero) notifications)', () => {
    const settings = {
      ...defaultSettings,
      playSound: true,
      showNotifications: true,
    };

    spyOn(notificationsHelpers, 'raiseNativeNotification');
    spyOn(notificationsHelpers, 'raiseSoundNotification');

    notificationsHelpers.triggerNativeNotifications(
      [],
      [],
      settings,
      mockAccounts
    );

    expect(notificationsHelpers.raiseNativeNotification).not.toHaveBeenCalled();
    expect(notificationsHelpers.raiseSoundNotification).not.toHaveBeenCalled();
  });

  it('should click on a native notification (with 1 notification)', () => {
    spyOn(comms, 'openExternalLink');

    const nativeNotification: Notification = notificationsHelpers.raiseNativeNotification(
      [mockedGithubNotifications[0]],
      defaultSettings,
      mockAccounts
    );
    nativeNotification.onclick(null);

    const notif = mockedGithubNotifications[0];
    const newUrl = generateGitHubWebUrl(
      notif.subject.url,
      notif.id,
      mockedUser.id,
      '#issuecomment-' + getCommentId(notif.subject.latest_comment_url)
    );
    expect(comms.openExternalLink).toHaveBeenCalledTimes(1);
    expect(comms.openExternalLink).toHaveBeenCalledWith(newUrl);
  });

  it('should click on a native notification (with more than 1 notification)', () => {
    spyOn(comms, 'reOpenWindow');

    const nativeNotification = notificationsHelpers.raiseNativeNotification(
      mockedGithubNotifications,
      defaultSettings,
      mockAccounts
    );
    nativeNotification.onclick(null);

    expect(comms.reOpenWindow).toHaveBeenCalledTimes(1);
  });

  it('should play a sound', () => {
    spyOn(window.Audio.prototype, 'play');
    notificationsHelpers.raiseSoundNotification();
    expect(window.Audio.prototype.play).toHaveBeenCalledTimes(1);
  });
});
