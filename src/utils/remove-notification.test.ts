import { mockSingleAccountNotifications } from '../__mocks__/notifications-mocks';
import { mockSettings } from '../__mocks__/state-mocks';
import { READ_NOTIFICATION_CLASS_NAME } from '../styles/gitify';
import { mockSingleNotification } from './api/__mocks__/response-mocks';
import { removeNotification } from './remove-notification';

describe('utils/remove-notification.ts', () => {
  const notificationId = mockSingleNotification.id;
  const hostname = mockSingleAccountNotifications[0].account.hostname;

  it('should remove a notification if it exists', () => {
    expect(mockSingleAccountNotifications[0].notifications.length).toBe(1);

    const result = removeNotification(
      { ...mockSettings, delayNotificationState: false },
      notificationId,
      mockSingleAccountNotifications,
      hostname,
    );

    expect(result[0].notifications.length).toBe(0);
  });

  it('should set notification as opaque if delayNotificationState enabled', () => {
    const mockElement = document.createElement('div');
    mockElement.id = mockSingleAccountNotifications[0].notifications[0].id;
    jest.spyOn(document, 'getElementById').mockReturnValue(mockElement);

    expect(mockSingleAccountNotifications[0].notifications.length).toBe(1);

    const result = removeNotification(
      { ...mockSettings, delayNotificationState: true },
      notificationId,
      mockSingleAccountNotifications,
      hostname,
    );

    expect(result[0].notifications.length).toBe(1);
    expect(document.getElementById).toHaveBeenCalledWith(
      mockSingleAccountNotifications[0].notifications[0].id,
    );
    expect(mockElement.className).toContain(READ_NOTIFICATION_CLASS_NAME);
  });
});
