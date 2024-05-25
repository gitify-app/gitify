import { ipcRenderer } from 'electron';

import {
  mockedAccountNotifications,
  mockedSingleAccountNotifications,
} from '../__mocks__/notifications-mocks';
import { partialMockedNotification } from '../__mocks__/partial-mocks';
import { mockedAccounts, mockedSettings } from '../__mocks__/state-mocks';
import { defaultSettings } from '../context/App';
import type { SettingsState } from '../types';
import {
  mockedGitHubNotifications,
  mockedSingleNotification,
} from './api/__mocks__/response-mocks';
import * as helpers from './helpers';
import * as notificationsHelpers from './notifications';
import { filterNotifications } from './notifications';

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
      mockedAccounts,
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
      mockedAccounts,
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
      mockedAccounts,
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
      mockedAccounts,
    );

    expect(notificationsHelpers.raiseNativeNotification).not.toHaveBeenCalled();
    expect(notificationsHelpers.raiseSoundNotification).not.toHaveBeenCalled();
  });

  it('should click on a native notification (with 1 notification)', () => {
    jest.spyOn(helpers, 'openInBrowser');

    const nativeNotification: Notification =
      notificationsHelpers.raiseNativeNotification(
        [mockedSingleNotification],
        mockedAccounts,
      );
    nativeNotification.onclick(null);

    expect(helpers.openInBrowser).toHaveBeenCalledTimes(1);
    expect(helpers.openInBrowser).toHaveBeenLastCalledWith(
      mockedSingleNotification,
      mockedAccounts,
    );
    expect(ipcRenderer.send).toHaveBeenCalledWith('hide-window');
  });

  it('should click on a native notification (with more than 1 notification)', () => {
    const nativeNotification = notificationsHelpers.raiseNativeNotification(
      mockedGitHubNotifications,
      mockedAccounts,
    );
    nativeNotification.onclick(null);

    expect(ipcRenderer.send).toHaveBeenCalledWith('reopen-window');
  });

  it('should play a sound', () => {
    jest.spyOn(window.Audio.prototype, 'play');
    notificationsHelpers.raiseSoundNotification();
    expect(window.Audio.prototype.play).toHaveBeenCalledTimes(1);
  });

  describe('filterNotifications', () => {
    const mockNotifications = [
      partialMockedNotification({
        title: 'User authored notification',
        user: {
          login: 'user',
          html_url: 'https://github.com/user',
          avatar_url:
            'https://avatars.githubusercontent.com/u/133795385?s=200&v=4',
          type: 'User',
        },
      }),
      partialMockedNotification({
        title: 'Bot authored notification',
        user: {
          login: 'bot',
          html_url: 'https://github.com/bot',
          avatar_url:
            'https://avatars.githubusercontent.com/u/133795385?s=200&v=4',
          type: 'Bot',
        },
      }),
    ];

    it('should hide bot notifications when set to false', async () => {
      const result = filterNotifications(mockNotifications, {
        ...mockedSettings,
        showBots: false,
      });

      expect(result.length).toBe(1);
      expect(result).toEqual([mockNotifications[0]]);
    });

    it('should show bot notifications when set to true', async () => {
      const result = filterNotifications(mockNotifications, {
        ...mockedSettings,
        showBots: true,
      });

      expect(result.length).toBe(2);
      expect(result).toEqual(mockNotifications);
    });
  });
});
