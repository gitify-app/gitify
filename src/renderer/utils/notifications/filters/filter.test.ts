import { partialMockNotification } from '../../../__mocks__/partial-mocks';
import { mockSettings } from '../../../__mocks__/state-mocks';
import { defaultSettings } from '../../../context/defaults';
import type { Link, SettingsState } from '../../../types';
import {
  filterBaseNotifications,
  filterDetailedNotifications,
  hasAnyFiltersSet,
} from './filter';

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
        mockNotifications[0].reason = 'subscribed';
        mockNotifications[1].reason = 'manual';
        const result = filterBaseNotifications(mockNotifications, {
          ...mockSettings,
          filterReasons: ['manual'],
        });

        expect(result.length).toBe(1);
        expect(result).toEqual([mockNotifications[1]]);
      });
    });

    describe('filterDetailedNotifications', () => {
      it('should ignore user type, handle filters and state filters if detailed notifications not enabled', async () => {
        const result = filterDetailedNotifications(mockNotifications, {
          ...mockSettings,
          detailedNotifications: false,
          filterUserTypes: ['Bot'],
          filterIncludeHandles: ['github-user'],
          filterExcludeHandles: ['github-bot'],
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

      it('should filter notifications that match include user handle', async () => {
        const result = filterDetailedNotifications(mockNotifications, {
          ...mockSettings,
          detailedNotifications: true,
          filterIncludeHandles: ['github-user'],
        });

        expect(result.length).toBe(1);
        expect(result).toEqual([mockNotifications[0]]);
      });

      it('should filter notifications that match exclude user handle', async () => {
        const result = filterDetailedNotifications(mockNotifications, {
          ...mockSettings,
          detailedNotifications: true,
          filterExcludeHandles: ['github-bot'],
        });

        expect(result.length).toBe(1);
        expect(result).toEqual([mockNotifications[0]]);
      });

      it('should filter notifications by state when provided', async () => {
        mockNotifications[0].subject.state = 'open';
        mockNotifications[1].subject.state = 'closed';
        const result = filterDetailedNotifications(mockNotifications, {
          ...mockSettings,
          filterStates: ['closed'],
        });

        expect(result.length).toBe(1);
        expect(result).toEqual([mockNotifications[1]]);
      });

      it('should filter notifications that match include organization', async () => {
        // Initialize repository owner structure if it doesn't exist
        if (!mockNotifications[0].repository) {
          mockNotifications[0].repository = {} as any;
        }
        if (!mockNotifications[0].repository.owner) {
          mockNotifications[0].repository.owner = {} as any;
        }
        if (!mockNotifications[1].repository) {
          mockNotifications[1].repository = {} as any;
        }
        if (!mockNotifications[1].repository.owner) {
          mockNotifications[1].repository.owner = {} as any;
        }

        mockNotifications[0].repository.owner.login = 'microsoft';
        mockNotifications[1].repository.owner.login = 'github';

        // Apply base filtering first (where organization filtering now happens)
        let result = filterBaseNotifications(mockNotifications, {
          ...mockSettings,
          filterIncludeOrganizations: ['microsoft'],
        });

        // Then apply detailed filtering
        result = filterDetailedNotifications(result, {
          ...mockSettings,
          detailedNotifications: true,
          filterIncludeOrganizations: ['microsoft'],
        });

        expect(result.length).toBe(1);
        expect(result).toEqual([mockNotifications[0]]);
      });

      it('should filter notifications that match exclude organization', async () => {
        // Initialize repository owner structure if it doesn't exist
        if (!mockNotifications[0].repository) {
          mockNotifications[0].repository = {} as any;
        }
        if (!mockNotifications[0].repository.owner) {
          mockNotifications[0].repository.owner = {} as any;
        }
        if (!mockNotifications[1].repository) {
          mockNotifications[1].repository = {} as any;
        }
        if (!mockNotifications[1].repository.owner) {
          mockNotifications[1].repository.owner = {} as any;
        }

        mockNotifications[0].repository.owner.login = 'microsoft';
        mockNotifications[1].repository.owner.login = 'github';

        // Apply base filtering first (where organization filtering now happens)
        let result = filterBaseNotifications(mockNotifications, {
          ...mockSettings,
          filterExcludeOrganizations: ['github'],
        });

        // Then apply detailed filtering
        result = filterDetailedNotifications(result, {
          ...mockSettings,
          detailedNotifications: true,
          filterExcludeOrganizations: ['github'],
        });

        expect(result.length).toBe(1);
        expect(result).toEqual([mockNotifications[0]]);
      });
    });
  });

  describe('has filters', () => {
    it('default filter settings', () => {
      expect(hasAnyFiltersSet(defaultSettings)).toBe(false);
    });

    it('non-default user type filters', () => {
      const settings: SettingsState = {
        ...defaultSettings,
        filterUserTypes: ['Bot'],
      };
      expect(hasAnyFiltersSet(settings)).toBe(true);
    });

    it('non-default user handle includes filters', () => {
      const settings: SettingsState = {
        ...defaultSettings,
        filterIncludeHandles: ['gitify'],
      };
      expect(hasAnyFiltersSet(settings)).toBe(true);
    });

    it('non-default user handle excludes filters', () => {
      const settings: SettingsState = {
        ...defaultSettings,
        filterExcludeHandles: ['gitify'],
      };
      expect(hasAnyFiltersSet(settings)).toBe(true);
    });

    it('non-default organization includes filters', () => {
      const settings: SettingsState = {
        ...defaultSettings,
        filterIncludeOrganizations: ['microsoft'],
      };
      expect(hasAnyFiltersSet(settings)).toBe(true);
    });

    it('non-default organization excludes filters', () => {
      const settings: SettingsState = {
        ...defaultSettings,
        filterExcludeOrganizations: ['github'],
      };
      expect(hasAnyFiltersSet(settings)).toBe(true);
    });

    it('non-default subject type filters', () => {
      const settings: SettingsState = {
        ...defaultSettings,
        filterSubjectTypes: ['Issue'],
      };
      expect(hasAnyFiltersSet(settings)).toBe(true);
    });

    it('non-default state filters', () => {
      const settings: SettingsState = {
        ...defaultSettings,
        filterStates: ['draft', 'merged'],
      };
      expect(hasAnyFiltersSet(settings)).toBe(true);
    });

    it('non-default reason filters', () => {
      const settings: SettingsState = {
        ...defaultSettings,
        filterReasons: ['subscribed', 'manual'],
      };
      expect(hasAnyFiltersSet(settings)).toBe(true);
    });
  });
});
