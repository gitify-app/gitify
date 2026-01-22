import { mockGitHubEnterpriseServerAccount } from '../../__mocks__/account-mocks';
import {
  mockGitifyNotification,
  mockSingleAccountNotifications,
} from '../../__mocks__/notifications-mocks';
import { mockSettings } from '../../__mocks__/state-mocks';

import type { SettingsState } from '../../types';

import {
  removeNotificationsForAccount,
  shouldRemoveNotificationsFromState,
} from './remove';

describe('renderer/utils/remove.ts', () => {
  describe('shouldRemoveNotificationsFromState', () => {
    it.each([
      {
        delayNotificationState: false,
        fetchReadNotifications: false,
        expected: true,
        description:
          'both delayNotificationState and fetchReadNotifications are false',
      },
      {
        delayNotificationState: true,
        fetchReadNotifications: false,
        expected: false,
        description: 'delayNotificationState is true',
      },
      {
        delayNotificationState: false,
        fetchReadNotifications: true,
        expected: false,
        description: 'fetchReadNotifications is true',
      },
      {
        delayNotificationState: true,
        fetchReadNotifications: true,
        expected: false,
        description:
          'both delayNotificationState and fetchReadNotifications are true',
      },
    ])('should return $expected when $description', ({
      delayNotificationState,
      fetchReadNotifications,
      expected,
    }) => {
      const settings: SettingsState = {
        ...mockSettings,
        delayNotificationState,
        fetchReadNotifications,
      };

      expect(shouldRemoveNotificationsFromState(settings)).toBe(expected);
    });
  });

  describe('removeNotificationsForAccount', () => {
    it('should remove a notification if it exists', () => {
      expect(mockSingleAccountNotifications[0].notifications.length).toBe(1);

      const result = removeNotificationsForAccount(
        mockSingleAccountNotifications[0].account,
        { ...mockSettings, delayNotificationState: false },
        [mockGitifyNotification],
        mockSingleAccountNotifications,
      );

      expect(result[0].notifications.length).toBe(0);
    });

    it('should mark as read and skip notification removal if delay state enabled', () => {
      expect(mockSingleAccountNotifications[0].notifications.length).toBe(1);

      const result = removeNotificationsForAccount(
        mockSingleAccountNotifications[0].account,
        { ...mockSettings, delayNotificationState: true },
        [mockGitifyNotification],
        mockSingleAccountNotifications,
      );

      expect(result[0].notifications.length).toBe(1);
      expect(result[0].notifications[0].unread).toBe(false);
    });

    it('should skip notification removal if delay state enabled and nothing to remove', () => {
      expect(mockSingleAccountNotifications[0].notifications.length).toBe(1);

      const result = removeNotificationsForAccount(
        mockSingleAccountNotifications[0].account,
        { ...mockSettings, delayNotificationState: true },
        [
          {
            ...mockGitifyNotification,
            id: 'non-existent-id',
          },
        ],
        mockSingleAccountNotifications,
      );

      expect(result[0].notifications.length).toBe(1);
      expect(result[0].notifications[0].unread).toBe(true);
    });

    it('should skip notification removal if nothing to remove', () => {
      expect(mockSingleAccountNotifications[0].notifications.length).toBe(1);

      const result = removeNotificationsForAccount(
        mockSingleAccountNotifications[0].account,
        { ...mockSettings, delayNotificationState: false },
        [],
        mockSingleAccountNotifications,
      );

      expect(result[0].notifications.length).toBe(1);
      expect(result[0].notifications[0]).toBe(
        mockSingleAccountNotifications[0].notifications[0],
      );
    });

    it('should not modify notifications when account UUID does not match', () => {
      const result = removeNotificationsForAccount(
        mockGitHubEnterpriseServerAccount, // Different account
        { ...mockSettings, delayNotificationState: false },
        [mockGitifyNotification],
        mockSingleAccountNotifications,
      );

      expect(result[0].notifications.length).toBe(1);
      expect(result[0].notifications[0]).toBe(
        mockSingleAccountNotifications[0].notifications[0],
      );
    });

    it('should mark as read and skip removal when fetchReadNotifications is enabled', () => {
      expect(mockSingleAccountNotifications[0].notifications.length).toBe(1);

      const result = removeNotificationsForAccount(
        mockSingleAccountNotifications[0].account,
        { ...mockSettings, fetchReadNotifications: true },
        [mockGitifyNotification],
        mockSingleAccountNotifications,
      );

      expect(result[0].notifications.length).toBe(1);
      expect(result[0].notifications[0].unread).toBe(false);
    });

    it('should remove notifications when fetchReadNotifications is disabled', () => {
      expect(mockSingleAccountNotifications[0].notifications.length).toBe(1);

      const result = removeNotificationsForAccount(
        mockSingleAccountNotifications[0].account,
        { ...mockSettings, fetchReadNotifications: false },
        [mockGitifyNotification],
        mockSingleAccountNotifications,
      );

      expect(result[0].notifications.length).toBe(0);
    });
  });
});
