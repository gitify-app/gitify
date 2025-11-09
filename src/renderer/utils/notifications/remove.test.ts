import { mockSingleAccountNotifications } from '../../__mocks__/notifications-mocks';
import { mockSettings } from '../../__mocks__/state-mocks';
import { mockSingleNotification } from '../api/__mocks__/response-mocks';
import { removeNotifications } from './remove';

describe('renderer/utils/remove.ts', () => {
  it('should remove a notification if it exists', () => {
    expect(mockSingleAccountNotifications[0].notifications.length).toBe(1);

    const result = removeNotifications(
      { ...mockSettings, delayNotificationState: false },
      [mockSingleNotification],
      mockSingleAccountNotifications,
    );

    expect(result[0].notifications.length).toBe(0);
  });

  it('should skip notification removal if delay state enabled', () => {
    expect(mockSingleAccountNotifications[0].notifications.length).toBe(1);

    const result = removeNotifications(
      { ...mockSettings, delayNotificationState: true },
      [mockSingleNotification],
      mockSingleAccountNotifications,
    );

    expect(result[0].notifications.length).toBe(1);
    expect(result[0].notifications[0].unread).toBe(false);
  });

  it('should skip notification removal if nothing to remove', () => {
    expect(mockSingleAccountNotifications[0].notifications.length).toBe(1);

    const result = removeNotifications(
      { ...mockSettings, delayNotificationState: false },
      [],
      mockSingleAccountNotifications,
    );

    expect(result[0].notifications.length).toBe(1);
  });
});
