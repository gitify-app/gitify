import { partialMockNotification } from '../../../__mocks__/partial-mocks';
import { mockSettings } from '../../../__mocks__/state-mocks';
import { defaultSettings } from '../../../context/App';
import type { Link, SettingsState } from '../../../types';
import { filterNotifications, hasAnyFiltersSet } from './filter';

describe('renderer/utils/notifications/filters/filter.ts', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('filterNotifications', () => {
    const mockNotifications = [
      partialMockNotification({
        title: 'User authored notification',
        user: {
          login: 'github-user',
          html_url: 'https://github.com/user' as Link,
          avatar_url:
            'https://avatars.githubusercontent.com/u/133795385?s=200&v=4' as Link,
          type: 'User',
        },
      }),
      partialMockNotification({
        title: 'Bot authored notification',
        user: {
          login: 'github-bot',
          html_url: 'https://github.com/bot' as Link,
          avatar_url:
            'https://avatars.githubusercontent.com/u/133795385?s=200&v=4' as Link,
          type: 'Bot',
        },
      }),
    ];

    it('should ignore user type or handle filters if detailed notifications not enabled', async () => {
      const result = filterNotifications(mockNotifications, {
        ...mockSettings,
        detailedNotifications: false,
        filterUserTypes: ['Bot'],
        filterIncludeHandles: ['github-user'],
        filterExcludeHandles: ['github-bot'],
      });

      expect(result.length).toBe(2);
      expect(result).toEqual(mockNotifications);
    });

    it('should filter notifications by user type provided', async () => {
      const result = filterNotifications(mockNotifications, {
        ...mockSettings,
        detailedNotifications: true,
        filterUserTypes: ['Bot'],
      });

      expect(result.length).toBe(1);
      expect(result).toEqual([mockNotifications[1]]);
    });

    it('should filter notifications that match include user handle', async () => {
      const result = filterNotifications(mockNotifications, {
        ...mockSettings,
        detailedNotifications: true,
        filterIncludeHandles: ['github-user'],
      });

      expect(result.length).toBe(1);
      expect(result).toEqual([mockNotifications[0]]);
    });

    it('should filter notifications that match exclude user handle', async () => {
      const result = filterNotifications(mockNotifications, {
        ...mockSettings,
        detailedNotifications: true,
        filterExcludeHandles: ['github-bot'],
      });

      expect(result.length).toBe(1);
      expect(result).toEqual([mockNotifications[0]]);
    });

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

  describe('has filters', () => {
    it('default filter settings', () => {
      expect(hasAnyFiltersSet(defaultSettings)).toBe(false);
    });

    it('non-default user type filters', () => {
      const settings = {
        ...defaultSettings,
        filterUserTypes: ['Bot'],
      } as SettingsState;
      expect(hasAnyFiltersSet(settings)).toBe(true);
    });

    it('non-default user handle includes filters', () => {
      const settings = {
        ...defaultSettings,
        filterIncludeHandles: ['gitify'],
      } as SettingsState;
      expect(hasAnyFiltersSet(settings)).toBe(true);
    });

    it('non-default user handle excludes filters', () => {
      const settings = {
        ...defaultSettings,
        filterExcludeHandles: ['gitify'],
      } as SettingsState;
      expect(hasAnyFiltersSet(settings)).toBe(true);
    });

    it('non-default reason filters', () => {
      const settings = {
        ...defaultSettings,
        filterReasons: ['subscribed', 'manual'],
      } as SettingsState;
      expect(hasAnyFiltersSet(settings)).toBe(true);
    });
  });
});
