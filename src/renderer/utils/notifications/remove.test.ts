import { mockSingleAccountNotifications } from '../../__mocks__/notifications-mocks';
import {
  mockGitHubEnterpriseServerAccount,
  mockSettings,
} from '../../__mocks__/state-mocks';
import { mockSingleNotification } from '../api/__mocks__/response-mocks';
import { removeNotificationsForAccount } from './remove';

describe('renderer/utils/remove.ts', () => {
  it('should remove a notification if it exists', () => {
    expect(mockSingleAccountNotifications[0].notifications.length).toBe(1);

    const result = removeNotificationsForAccount(
      mockSingleAccountNotifications[0].account,
      { ...mockSettings, delayNotificationState: false },
      [mockSingleNotification],
      mockSingleAccountNotifications,
    );

    expect(result[0].notifications.length).toBe(0);
  });

  it('should mark as read and skip notification removal if delay state enabled', () => {
    expect(mockSingleAccountNotifications[0].notifications.length).toBe(1);

    const result = removeNotificationsForAccount(
      mockSingleAccountNotifications[0].account,
      { ...mockSettings, delayNotificationState: true },
      [mockSingleNotification],
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
          ...mockSingleNotification,
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
  });

  it('should not modify notifications when account UUID does not match', () => {
    const result = removeNotificationsForAccount(
      mockGitHubEnterpriseServerAccount, // Different account
      { ...mockSettings, delayNotificationState: false },
      [mockSingleNotification],
      mockSingleAccountNotifications,
    );

    // Should return unchanged
    expect(result[0].notifications.length).toBe(1);
    expect(result[0].notifications[0]).toBe(
      mockSingleAccountNotifications[0].notifications[0],
    );
  });
});
