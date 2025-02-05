import { partialMockNotification } from '../../../__mocks__/partial-mocks';
import { mockSettings } from '../../../__mocks__/state-mocks';
import type { Link } from '../../../types';
import { filterNotifications } from './filter';

describe('renderer/utils/notifications/filters/filter.ts', () => {
  afterEach(() => {
    jest.clearAllMocks();
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

    // it('should hide bot notifications when set to true', async () => {
    //   const result = filterNotifications(mockNotifications, {
    //     ...mockSettings,
    //     hideBots: true,
    //   });

    //   expect(result.length).toBe(1);
    //   expect(result).toEqual([mockNotifications[0]]);
    // });

    // it('should show bot notifications when set to false', async () => {
    //   const result = filterNotifications(mockNotifications, {
    //     ...mockSettings,
    //     hideBots: false,
    //   });

    //   expect(result.length).toBe(2);
    //   expect(result).toEqual(mockNotifications);
    // });

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
