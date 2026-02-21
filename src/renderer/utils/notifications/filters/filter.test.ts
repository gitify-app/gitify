import { mockPartialGitifyNotification } from '../../../__mocks__/notifications-mocks';
import { mockSettings } from '../../../__mocks__/state-mocks';

import type { GitifyOwner, Link, SearchToken } from '../../../types';

import { useFiltersStore } from '../../../stores';
import { filterBaseNotifications, filterDetailedNotifications } from './filter';

describe('renderer/utils/notifications/filters/filter.ts', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('filterNotifications', () => {
    const mockNotifications = [
      mockPartialGitifyNotification(
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
            avatarUrl:
              'https://avatars.githubusercontent.com/u/133795385?s=200&v=4' as Link,
            type: 'Organization',
          } as GitifyOwner,
          fullName: 'gitify-app/gitify',
        },
      ),
      mockPartialGitifyNotification(
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
            avatarUrl:
              'https://avatars.githubusercontent.com/u/133795385?s=200&v=4' as Link,
            type: 'Organization',
          } as GitifyOwner,
          fullName: 'github/github',
        },
      ),
    ];

    describe('filterBaseNotifications', () => {
      it('should filter notifications by subject type when provided', () => {
        useFiltersStore.setState({
          subjectTypes: ['Issue'],
        });

        mockNotifications[0].subject.type = 'Issue';
        mockNotifications[1].subject.type = 'PullRequest';
        const result = filterBaseNotifications(mockNotifications);

        expect(result.length).toBe(1);
        expect(result).toEqual([mockNotifications[0]]);
      });

      it('should filter notifications by reasons when provided', async () => {
        useFiltersStore.setState({
          reasons: ['manual'],
        });

        mockNotifications[0].reason.code = 'subscribed';
        mockNotifications[1].reason.code = 'manual';
        const result = filterBaseNotifications(mockNotifications);

        expect(result.length).toBe(1);
        expect(result).toEqual([mockNotifications[1]]);
      });

      it('should filter notifications that match include organization', () => {
        useFiltersStore.setState({
          includeSearchTokens: ['org:gitify-app' as SearchToken],
        });

        const result = filterBaseNotifications(mockNotifications);

        expect(result.length).toBe(1);
        expect(result).toEqual([mockNotifications[0]]);
      });

      it('should filter notifications that match exclude organization', () => {
        useFiltersStore.setState({
          excludeSearchTokens: ['org:github' as SearchToken],
        });

        const result = filterBaseNotifications(mockNotifications);

        expect(result.length).toBe(1);
        expect(result).toEqual([mockNotifications[0]]);
      });

      it('should filter notifications that match include repository', () => {
        useFiltersStore.setState({
          includeSearchTokens: ['repo:gitify-app/gitify' as SearchToken],
        });

        const result = filterBaseNotifications(mockNotifications);

        expect(result.length).toBe(1);
        expect(result).toEqual([mockNotifications[0]]);
      });

      it('should filter notifications that match exclude repository', () => {
        useFiltersStore.setState({
          excludeSearchTokens: ['repo:github/github' as SearchToken],
        });

        const result = filterBaseNotifications(mockNotifications);

        expect(result.length).toBe(1);
        expect(result).toEqual([mockNotifications[0]]);
      });
    });

    describe('filterDetailedNotifications', () => {
      it('should ignore user type, handle filters and state filters if detailed notifications not enabled', async () => {
        useFiltersStore.setState({
          userTypes: ['Bot'],
          includeSearchTokens: ['author:github-user' as SearchToken],
          excludeSearchTokens: ['author:github-bot' as SearchToken],
          states: ['merged'],
        });

        const result = filterDetailedNotifications(mockNotifications, {
          ...mockSettings,
          detailedNotifications: false,
        });

        expect(result.length).toBe(2);
        expect(result).toEqual(mockNotifications);
      });

      it('should filter notifications by user type provided', async () => {
        useFiltersStore.setState({
          userTypes: ['Bot'],
        });

        const result = filterDetailedNotifications(mockNotifications, {
          ...mockSettings,
          detailedNotifications: true,
        });

        expect(result.length).toBe(1);
        expect(result).toEqual([mockNotifications[1]]);
      });

      it('should filter notifications that match include author handle', async () => {
        useFiltersStore.setState({
          includeSearchTokens: ['author:github-user' as SearchToken],
        });

        const result = filterDetailedNotifications(mockNotifications, {
          ...mockSettings,
          detailedNotifications: true,
        });

        expect(result.length).toBe(1);
        expect(result).toEqual([mockNotifications[0]]);
      });

      it('should filter notifications that match exclude author handle', async () => {
        useFiltersStore.setState({
          excludeSearchTokens: ['author:github-bot' as SearchToken],
        });

        const result = filterDetailedNotifications(mockNotifications, {
          ...mockSettings,
          detailedNotifications: true,
        });

        expect(result.length).toBe(1);
        expect(result).toEqual([mockNotifications[0]]);
      });

      it('should filter notifications by state when provided', async () => {
        useFiltersStore.setState({ states: ['closed'] });

        mockNotifications[0].subject.state = 'OPEN';
        mockNotifications[1].subject.state = 'CLOSED';
        const result = filterDetailedNotifications(
          mockNotifications,
          mockSettings,
        );

        expect(result.length).toBe(1);
        expect(result).toEqual([mockNotifications[1]]);
      });
    });
  });
});
