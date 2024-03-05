import { ipcRenderer } from 'electron';

import {
  mockedAccountNotifications,
  mockedGithubNotifications,
  mockedSingleAccountNotifications,
} from '../__mocks__/mockedData';
import { mockAccounts } from '../__mocks__/mock-state';
import * as notificationsHelpers from './notifications';
import { SettingsState } from '../types';
import { defaultSettings } from '../context/App';
import * as helpers from './helpers';

describe('utils/notifications.ts', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

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
      mockAccounts,
    );

    expect(notificationsHelpers.raiseNativeNotification).toHaveBeenCalledTimes(
      1,
    );
    expect(notificationsHelpers.raiseSoundNotification).toHaveBeenCalledTimes(
      1,
    );
  });

  it('should not raise a notification (settings - off)', () => {
    const settings = {
      ...defaultSettings,
      playSound: false,
      showNotifications: false,
    };

    jest.spyOn(notificationsHelpers, 'raiseNativeNotification');
    jest.spyOn(notificationsHelpers, 'raiseSoundNotification');

    notificationsHelpers.triggerNativeNotifications(
      [],
      mockedAccountNotifications,
      settings,
      mockAccounts,
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

    jest.spyOn(notificationsHelpers, 'raiseNativeNotification');
    jest.spyOn(notificationsHelpers, 'raiseSoundNotification');

    notificationsHelpers.triggerNativeNotifications(
      mockedSingleAccountNotifications,
      mockedSingleAccountNotifications,
      settings,
      mockAccounts,
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

    jest.spyOn(notificationsHelpers, 'raiseNativeNotification');
    jest.spyOn(notificationsHelpers, 'raiseSoundNotification');

    notificationsHelpers.triggerNativeNotifications(
      [],
      [],
      settings,
      mockAccounts,
    );

    expect(notificationsHelpers.raiseNativeNotification).not.toHaveBeenCalled();
    expect(notificationsHelpers.raiseSoundNotification).not.toHaveBeenCalled();
  });

  it('should click on a native notification (with 1 notification)', () => {
    jest.spyOn(helpers, 'openInBrowser');

    const nativeNotification: Notification =
      notificationsHelpers.raiseNativeNotification(
        [mockedGithubNotifications[0]],
        mockAccounts,
      );
    nativeNotification.onclick(null);

    expect(helpers.openInBrowser).toHaveBeenCalledTimes(1);
    expect(helpers.openInBrowser).toHaveBeenLastCalledWith(
      mockedGithubNotifications[0],
      mockAccounts,
    );
    expect(ipcRenderer.send).toHaveBeenCalledWith('hide-window');
  });

  it('should click on a native notification (with more than 1 notification)', () => {
    const nativeNotification = notificationsHelpers.raiseNativeNotification(
      mockedGithubNotifications,
      mockAccounts,
    );
    nativeNotification.onclick(null);

    expect(ipcRenderer.send).toHaveBeenCalledWith('reopen-window');
  });

  it('should play a sound', () => {
    jest.spyOn(window.Audio.prototype, 'play');
    notificationsHelpers.raiseSoundNotification();
    expect(window.Audio.prototype.play).toHaveBeenCalledTimes(1);
  });
});
