import {
  mockAccountNotifications,
  mockSingleAccountNotifications,
} from '../../__mocks__/notifications-mocks';
import { mockAuth } from '../../__mocks__/state-mocks';
import { defaultSettings } from '../../context/defaults';
import type { SettingsState } from '../../types';
import {
  mockGitHubNotifications,
  mockSingleNotification,
} from '../api/__mocks__/response-mocks';
import * as comms from '../comms';
import * as links from '../links';
import * as native from './native';

const raiseNativeNotificationMock = jest.spyOn(
  native,
  'raiseNativeNotification',
);
const raiseSoundNotificationMock = jest.spyOn(native, 'raiseSoundNotification');

describe('renderer/utils/notifications/native.ts', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('triggerNativeNotifications', () => {
    it('should raise a native notification and play sound for a single new notification', () => {
      const settings: SettingsState = {
        ...defaultSettings,
        playSound: true,
        showNotifications: true,
      };

      native.triggerNativeNotifications([], mockSingleAccountNotifications, {
        auth: mockAuth,
        settings,
      });

      expect(raiseNativeNotificationMock).toHaveBeenCalledTimes(1);

      expect(raiseSoundNotificationMock).toHaveBeenCalledTimes(1);
      expect(raiseSoundNotificationMock).toHaveBeenCalledWith(0.2);
    });

    it('should raise a native notification and play sound for multiple new notifications', () => {
      const settings: SettingsState = {
        ...defaultSettings,
        playSound: true,
        showNotifications: true,
      };

      native.triggerNativeNotifications([], mockAccountNotifications, {
        auth: mockAuth,
        settings,
      });

      expect(raiseNativeNotificationMock).toHaveBeenCalledTimes(1);

      expect(raiseSoundNotificationMock).toHaveBeenCalledTimes(1);
      expect(raiseSoundNotificationMock).toHaveBeenCalledWith(0.2);
    });

    it('should not raise a native notification or play a sound when there are no new notifications', () => {
      const settings: SettingsState = {
        ...defaultSettings,
        playSound: true,
        showNotifications: true,
      };

      native.triggerNativeNotifications(
        mockSingleAccountNotifications,
        mockSingleAccountNotifications,
        {
          auth: mockAuth,
          settings,
        },
      );

      expect(raiseNativeNotificationMock).not.toHaveBeenCalled();
      expect(raiseSoundNotificationMock).not.toHaveBeenCalled();
    });

    it('should not raise a native notification or play a sound when there are zero notifications', () => {
      const settings: SettingsState = {
        ...defaultSettings,
        playSound: true,
        showNotifications: true,
      };

      native.triggerNativeNotifications([], [], {
        auth: mockAuth,
        settings,
      });

      expect(raiseNativeNotificationMock).not.toHaveBeenCalled();
      expect(raiseSoundNotificationMock).not.toHaveBeenCalled();
    });

    it('should not raise a native notification when setting disabled', () => {
      const settings: SettingsState = {
        ...defaultSettings,
        showNotifications: false,
      };

      native.triggerNativeNotifications([], mockAccountNotifications, {
        auth: mockAuth,
        settings,
      });

      expect(raiseNativeNotificationMock).not.toHaveBeenCalled();
    });
  });

  describe('raiseNativeNotification', () => {
    it('should click on a native notification (with 1 notification)', () => {
      const hideWindowMock = jest.spyOn(comms, 'hideWindow');
      jest.spyOn(links, 'openNotification');

      const nativeNotification: Notification = native.raiseNativeNotification([
        mockSingleNotification,
      ]);
      nativeNotification.onclick(null);

      expect(links.openNotification).toHaveBeenCalledTimes(1);
      expect(links.openNotification).toHaveBeenLastCalledWith(
        mockSingleNotification,
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
});
