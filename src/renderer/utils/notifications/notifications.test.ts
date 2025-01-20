import { mockSingleAccountNotifications } from '../../__mocks__/notifications-mocks';
import { getNotificationCount } from './notifications';

describe('renderer/utils/notifications/notifications.ts', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('getNotificationCount', () => {
    const result = getNotificationCount(mockSingleAccountNotifications);

    expect(result).toBe(1);
  });
});
