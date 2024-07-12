import {
  mockAccountNotifications,
  mockSingleAccountNotifications,
} from '../__mocks__/notifications-mocks';
import { mockSettings } from '../__mocks__/state-mocks';
import { mockSingleNotification } from './api/__mocks__/response-mocks';
import { removeNotifications } from './remove-notifications';

describe('utils/remove-notifications.ts', () => {
  it("should remove a repo's notifications - single", () => {
    expect(mockSingleAccountNotifications[0].notifications.length).toBe(1);

    const result = removeNotifications(
      mockSettings,
      mockSingleNotification,
      mockSingleAccountNotifications,
    );

    expect(result[0].notifications.length).toBe(0);
  });

  it("should remove a repo's notifications - multiple", () => {
    expect(mockAccountNotifications[0].notifications.length).toBe(2);
    expect(mockAccountNotifications[1].notifications.length).toBe(2);

    const result = removeNotifications(
      mockSettings,
      mockSingleNotification,
      mockAccountNotifications,
    );

    expect(result[0].notifications.length).toBe(0);
    expect(result[1].notifications.length).toBe(2);
  });

  it('should skip notification removal if delay state enabled', () => {
    expect(mockSingleAccountNotifications[0].notifications.length).toBe(1);

    const result = removeNotifications(
      { ...mockSettings, delayNotificationState: true },
      mockSingleNotification,
      mockSingleAccountNotifications,
    );

    expect(result[0].notifications.length).toBe(1);
  });
});
