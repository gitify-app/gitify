import {
  mockAccountNotifications,
  mockSingleAccountNotifications,
} from '../__mocks__/notifications-mocks';
import { partialMockNotification } from '../__mocks__/partial-mocks';
import { mockAuth, mockSettings } from '../__mocks__/state-mocks';
import { defaultSettings } from '../context/App';
import type { Link, SettingsState } from '../types';
import { mockGitHubNotifications } from './api/__mocks__/response-mocks';
import * as comms from './comms';
import * as links from './links';
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
      mockAccountNotifications,
      {
        auth: mockAuth,
        settings,
      },
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
      mockAccountNotifications,
      {
        auth: mockAuth,
        settings,
      },
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
      mockSingleAccountNotifications,
      mockSingleAccountNotifications,
      { auth: mockAuth, settings },
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

    notificationsHelpers.triggerNativeNotifications([], [], {
      auth: mockAuth,
      settings,
    });
    notificationsHelpers.triggerNativeNotifications([], [], {
      auth: mockAuth,
      settings,
    });

    expect(notificationsHelpers.raiseNativeNotification).not.toHaveBeenCalled();
    expect(notificationsHelpers.raiseSoundNotification).not.toHaveBeenCalled();
  });

  it('should click on a native notification (with 1 notification)', () => {
    const hideWindowMock = jest.spyOn(comms, 'hideWindow');
    jest.spyOn(links, 'openNotification');

    const nativeNotification: Notification =
      notificationsHelpers.raiseNativeNotification([
        mockGitHubNotifications[0],
      ]);
    nativeNotification.onclick(null);

    expect(links.openNotification).toHaveBeenCalledTimes(1);
    expect(links.openNotification).toHaveBeenLastCalledWith(
      mockGitHubNotifications[0],
    );
    expect(hideWindowMock).toHaveBeenCalledTimes(1);
  });

  it('should click on a native notification (with more than 1 notification)', () => {
    const showWindowMock = jest.spyOn(comms, 'showWindow');

    const nativeNotification = notificationsHelpers.raiseNativeNotification(
      mockGitHubNotifications,
    );
    nativeNotification.onclick(null);

    expect(showWindowMock).toHaveBeenCalledTimes(1);
  });

  it('should play a sound', () => {
    jest.spyOn(window.Audio.prototype, 'play');
    notificationsHelpers.raiseSoundNotification();
    expect(window.Audio.prototype.play).toHaveBeenCalledTimes(1);
  });

  describe('filterNotifications', () => {
    const mockNotifications = [
      partialMockNotification({
        title: 'User authored notification',
        user: {
          login: 'user',
          html_url: 'https://github.com/user' as Link,
          avatar_url:
            'https://avatars.githubusercontent.com/u/133795385?s=200&v=4' as Link,
          type: 'User',
        },
      }),
      partialMockNotification({
        title: 'Bot authored notification',
        user: {
          login: 'bot',
          html_url: 'https://github.com/bot' as Link,
          avatar_url:
            'https://avatars.githubusercontent.com/u/133795385?s=200&v=4' as Link,
          type: 'Bot',
        },
      }),
    ];

    it('should hide bot notifications when set to true', async () => {
      const result = filterNotifications(mockNotifications, {
        ...mockSettings,
        hideBots: true,
      });

      expect(result.length).toBe(1);
      expect(result).toEqual([mockNotifications[0]]);
    });

    it('should show bot notifications when set to false', async () => {
      const result = filterNotifications(mockNotifications, {
        ...mockSettings,
        hideBots: false,
      });

      expect(result.length).toBe(2);
      expect(result).toEqual(mockNotifications);
    });

    it('should filter notifications by reasons when provided', async () => {
      mockNotifications[0].reason = 'subscribed';
      mockNotifications[1].reason = 'manual';
      const result = filterNotifications(mockNotifications, {
        ...mockSettings,
        filterReasons: ['manual'],
      });

      expect(result.length).toBe(1);
      expect(result).toEqual([mockNotifications[1]]);
    });
  });
});
