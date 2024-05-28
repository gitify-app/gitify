import { mockSingleAccountNotifications } from '../__mocks__/notifications-mocks';
import { mockSettings } from '../__mocks__/state-mocks';
import { mockSingleNotification } from './api/__mocks__/response-mocks';
import Constants from './constants';
import { removeNotification } from './remove-notification';

describe('utils/remove-notification.ts', () => {
  const notificationId = mockedSingleNotification.id;
  const hostname = mockedSingleAccountNotifications[0].account.hostname;

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
    expect(mockElement.className).toContain(Constants.READ_CLASS_NAME);
  });
});
