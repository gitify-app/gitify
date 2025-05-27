import {
  mockAccountNotifications,
  mockSingleAccountNotifications,
} from '../../__mocks__/notifications-mocks';
import { mockAuth } from '../../__mocks__/state-mocks';
import { defaultSettings } from '../../context/App';
import type { SettingsState } from '../../types';
import { mockGitHubNotifications } from '../api/__mocks__/response-mocks';
import * as comms from '../comms';
import * as links from '../links';
import * as native from './native';

describe('renderer/utils/notifications/native.ts', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('triggerNativeNotifications', () => {
    it('should raise a native notification (settings - on)', () => {
      const settings: SettingsState = {
        ...defaultSettings,
        playSound: true,
        showNotifications: true,
      };

      jest.spyOn(native, 'raiseNativeNotification');
      jest.spyOn(native, 'raiseSoundNotification');

      native.triggerNativeNotifications([], mockAccountNotifications, {
        auth: mockAuth,
        settings,
      });

      expect(native.raiseNativeNotification).toHaveBeenCalledTimes(1);
      expect(native.raiseSoundNotification).toHaveBeenCalledTimes(1);
    });

    it('should not raise a native notification (settings - off)', () => {
      const settings = {
        ...defaultSettings,
        playSound: false,
        showNotifications: false,
      };

      jest.spyOn(native, 'raiseNativeNotification');
      jest.spyOn(native, 'raiseSoundNotification');

      native.triggerNativeNotifications([], mockAccountNotifications, {
        auth: mockAuth,
        settings,
      });

      expect(native.raiseNativeNotification).not.toHaveBeenCalled();
      expect(native.raiseSoundNotification).not.toHaveBeenCalled();
    });

    it('should not raise a native notification or play a sound (no new notifications)', () => {
      const settings = {
        ...defaultSettings,
        playSound: true,
        showNotifications: true,
      };

      jest.spyOn(native, 'raiseNativeNotification');
      jest.spyOn(native, 'raiseSoundNotification');

      native.triggerNativeNotifications(
        mockSingleAccountNotifications,
        mockSingleAccountNotifications,
        { auth: mockAuth, settings },
      );

      expect(native.raiseNativeNotification).not.toHaveBeenCalled();
      expect(native.raiseSoundNotification).not.toHaveBeenCalled();
    });

    it('should not raise a native notification (because of 0(zero) notifications)', () => {
      const settings = {
        ...defaultSettings,
        playSound: true,
        showNotifications: true,
      };

      jest.spyOn(native, 'raiseNativeNotification');
      jest.spyOn(native, 'raiseSoundNotification');

      native.triggerNativeNotifications([], [], {
        auth: mockAuth,
        settings,
      });
      native.triggerNativeNotifications([], [], {
        auth: mockAuth,
        settings,
      });

      expect(native.raiseNativeNotification).not.toHaveBeenCalled();
      expect(native.raiseSoundNotification).not.toHaveBeenCalled();
    });
  });

  describe('raiseNativeNotification', () => {
    it('should click on a native notification (with 1 notification)', () => {
      const hideWindowMock = jest.spyOn(comms, 'hideWindow');
      jest.spyOn(links, 'openNotification');

      const nativeNotification: Notification = native.raiseNativeNotification([
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

      const nativeNotification = native.raiseNativeNotification(
        mockGitHubNotifications,
      );
      nativeNotification.onclick(null);

      expect(showWindowMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('raiseSoundNotification', () => {
    it('should play a sound', () => {
      jest.spyOn(window.Audio.prototype, 'play');
      native.raiseSoundNotification();
      expect(window.Audio.prototype.play).toHaveBeenCalledTimes(1);
    });

    it('should play notification sound with correct volume', () => {
      const settings: SettingsState = {
        ...defaultSettings,
        playSound: true,
        showNotifications: false,
        notificationVolume: 80,
      };

      const raiseSoundNotificationMock = jest.spyOn(
        native,
        'raiseSoundNotification',
      );
      jest.spyOn(native, 'raiseNativeNotification');

      native.triggerNativeNotifications([], mockAccountNotifications, {
        auth: mockAuth,
        settings,
      });

      expect(raiseSoundNotificationMock).toHaveBeenCalledWith(0.8);
      expect(native.raiseNativeNotification).not.toHaveBeenCalled();
    });
  });
});
