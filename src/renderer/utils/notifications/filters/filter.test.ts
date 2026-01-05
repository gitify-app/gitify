import { createPartialMockNotification } from '../../../__mocks__/notifications-mocks';
import { mockSettings } from '../../../__mocks__/state-mocks';
import { defaultSettings } from '../../../context/defaults';
import type {
  GitifyOwner,
  Link,
  SearchToken,
  SettingsState,
} from '../../../types';
import {
  filterBaseNotifications,
  filterDetailedNotifications,
  hasActiveFilters,
} from './filter';

describe('renderer/utils/notifications/filters/filter.ts', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('filterNotifications', () => {
    const mockNotifications = [
      createPartialMockNotification(
        {
          title: 'User authored notification',
          user: {
            login: 'github-user',
            htmlUrl: 'https://github.com/user' as Link,
            avatarUrl:
              'https://avatars.githubusercontent.com/u/133795385?s=200&v=4' as Link,
            type: 'User',
          },
        },
        {
          owner: {
            login: 'gitify-app',
            avatarUrl: 'https://avatars.githubusercontent.com/u/1' as Link,
            type: 'Organization',
          } as GitifyOwner,
          fullName: 'gitify-app/gitify',
        },
      ),
      createPartialMockNotification(
        {
          title: 'Bot authored notification',
          user: {
            login: 'github-bot',
            htmlUrl: 'https://github.com/bot' as Link,
            avatarUrl:
              'https://avatars.githubusercontent.com/u/133795385?s=200&v=4' as Link,
            type: 'Bot',
          },
        },
        {
          owner: {
            login: 'github',
            avatarUrl: 'https://avatars.githubusercontent.com/u/2' as Link,
            type: 'Organization',
          } as GitifyOwner,
          fullName: 'github/github',
        },
      ),
    ];

    describe('filterBaseNotifications', () => {
      it('should filter notifications by subject type when provided', async () => {
        mockNotifications[0].subject.type = 'Issue';
        mockNotifications[1].subject.type = 'PullRequest';
        const result = filterBaseNotifications(mockNotifications, {
          ...mockSettings,
          filterSubjectTypes: ['Issue'],
        });

        expect(result.length).toBe(1);
        expect(result).toEqual([mockNotifications[0]]);
      });

      it('should filter notifications by reasons when provided', async () => {
        mockNotifications[0].reason.code = 'subscribed';
        mockNotifications[1].reason.code = 'manual';
        const result = filterBaseNotifications(mockNotifications, {
          ...mockSettings,
          filterReasons: ['manual'],
        });

        expect(result.length).toBe(1);
        expect(result).toEqual([mockNotifications[1]]);
      });

      it('should filter notifications that match include organization', async () => {
        const result = filterBaseNotifications(mockNotifications, {
          ...mockSettings,
          filterIncludeSearchTokens: ['org:gitify-app' as SearchToken],
        });

        expect(result.length).toBe(1);
        expect(result).toEqual([mockNotifications[0]]);
      });

      it('should filter notifications that match exclude organization', async () => {
        const result = filterBaseNotifications(mockNotifications, {
          ...mockSettings,
          filterExcludeSearchTokens: ['org:github' as SearchToken],
        });

        expect(result.length).toBe(1);
        expect(result).toEqual([mockNotifications[0]]);
      });

      it('should filter notifications that match include repository', async () => {
        const result = filterBaseNotifications(mockNotifications, {
          ...mockSettings,
          filterIncludeSearchTokens: ['repo:gitify-app/gitify' as SearchToken],
        });

        expect(result.length).toBe(1);
        expect(result).toEqual([mockNotifications[0]]);
      });

      it('should filter notifications that match exclude repository', async () => {
        const result = filterBaseNotifications(mockNotifications, {
          ...mockSettings,
          filterExcludeSearchTokens: ['repo:github/github' as SearchToken],
        });

        expect(result.length).toBe(1);
        expect(result).toEqual([mockNotifications[0]]);
      });
    });

    describe('filterDetailedNotifications', () => {
      it('should ignore user type, handle filters and state filters if detailed notifications not enabled', async () => {
        const result = filterDetailedNotifications(mockNotifications, {
          ...mockSettings,
          detailedNotifications: false,
          filterUserTypes: ['Bot'],
          filterIncludeSearchTokens: ['author:github-user' as SearchToken],
          filterExcludeSearchTokens: ['author:github-bot' as SearchToken],
          filterStates: ['merged'],
        });

        expect(result.length).toBe(2);
        expect(result).toEqual(mockNotifications);
      });

      it('should filter notifications by user type provided', async () => {
        const result = filterDetailedNotifications(mockNotifications, {
          ...mockSettings,
          detailedNotifications: true,
          filterUserTypes: ['Bot'],
        });

        expect(result.length).toBe(1);
        expect(result).toEqual([mockNotifications[1]]);
      });

      it('should filter notifications that match include author handle', async () => {
        const result = filterDetailedNotifications(mockNotifications, {
          ...mockSettings,
          detailedNotifications: true,
          filterIncludeSearchTokens: ['author:github-user' as SearchToken],
        });

        expect(result.length).toBe(1);
        expect(result).toEqual([mockNotifications[0]]);
      });

      it('should filter notifications that match exclude author handle', async () => {
        const result = filterDetailedNotifications(mockNotifications, {
          ...mockSettings,
          detailedNotifications: true,
          filterExcludeSearchTokens: ['author:github-bot' as SearchToken],
        });

        expect(result.length).toBe(1);
        expect(result).toEqual([mockNotifications[0]]);
      });

      it('should filter notifications by state when provided', async () => {
        mockNotifications[0].subject.state = 'OPEN';
        mockNotifications[1].subject.state = 'CLOSED';
        const result = filterDetailedNotifications(mockNotifications, {
          ...mockSettings,
          filterStates: ['closed'],
        });

        expect(result.length).toBe(1);
        expect(result).toEqual([mockNotifications[1]]);
      });
    });
  });

  describe('hasActiveFilters', () => {
    it('default filter settings', () => {
      expect(hasActiveFilters(defaultSettings)).toBe(false);
    });

    it('non-default search token includes filters', () => {
      const settings: SettingsState = {
        ...defaultSettings,
        filterIncludeSearchTokens: ['author:gitify' as SearchToken],
      };
      expect(hasActiveFilters(settings)).toBe(true);
    });

    it('non-default search token excludes filters', () => {
      const settings: SettingsState = {
        ...defaultSettings,
        filterExcludeSearchTokens: ['org:github' as SearchToken],
      };
      expect(hasActiveFilters(settings)).toBe(true);
    });

    it('non-default user type filters', () => {
      const settings: SettingsState = {
        ...defaultSettings,
        filterUserTypes: ['Bot'],
      };
      expect(hasActiveFilters(settings)).toBe(true);
    });

    it('non-default subject type filters', () => {
      const settings: SettingsState = {
        ...defaultSettings,
        filterSubjectTypes: ['Issue'],
      };
      expect(hasActiveFilters(settings)).toBe(true);
    });

    it('non-default state filters', () => {
      const settings: SettingsState = {
        ...defaultSettings,
        filterStates: ['draft', 'merged'],
      };
      expect(hasActiveFilters(settings)).toBe(true);
    });

    it('non-default reason filters', () => {
      const settings: SettingsState = {
        ...defaultSettings,
        filterReasons: ['subscribed', 'manual'],
      };
      expect(hasActiveFilters(settings)).toBe(true);
    });
  });
});
