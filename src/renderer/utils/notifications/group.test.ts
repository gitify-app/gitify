import { mockGitifyNotificationForRepoName } from '../../__mocks__/notifications-mocks';

import { GroupBy, useSettingsStore } from '../../stores';

import type { GitifyNotification } from '../../types';

import {
  getFlattenedNotificationsByRepo,
  groupNotificationsByRepository,
  isGroupByDate,
  isGroupByRepository,
} from './group';

describe('renderer/utils/notifications/group.ts', () => {
  describe('isGroupByDate', () => {
    it('returns true when groupBy is DATE', () => {
      useSettingsStore.setState({ groupBy: GroupBy.DATE });

      expect(isGroupByDate()).toBe(true);
    });

    it('returns false when groupBy is REPOSITORY', () => {
      useSettingsStore.setState({ groupBy: GroupBy.REPOSITORY });

      expect(isGroupByDate()).toBe(false);
    });
  });

  describe('isGroupByRepository', () => {
    it('returns true when groupBy is REPOSITORY', () => {
      useSettingsStore.setState({ groupBy: GroupBy.REPOSITORY });

      expect(isGroupByRepository()).toBe(true);
    });

    it('returns false when groupBy is DATE', () => {
      useSettingsStore.setState({ groupBy: GroupBy.DATE });

      expect(isGroupByRepository()).toBe(false);
    });
  });

  describe('groupNotificationsByRepository', () => {
    it('groups notifications by repository fullName', () => {
      const notifications: GitifyNotification[] = [
        mockGitifyNotificationForRepoName('1', 'owner/repo-a'),
        mockGitifyNotificationForRepoName('2', 'owner/repo-b'),
        mockGitifyNotificationForRepoName('3', 'owner/repo-a'),
      ];

      const result = groupNotificationsByRepository(notifications);

      expect(result.size).toBe(2);
      expect(result.get('owner/repo-a')?.map((n) => n.id)).toEqual(['1', '3']);
      expect(result.get('owner/repo-b')?.map((n) => n.id)).toEqual(['2']);
    });

    it('preserves first-seen repository order', () => {
      const notifications: GitifyNotification[] = [
        mockGitifyNotificationForRepoName('1', 'owner/repo-c'),
        mockGitifyNotificationForRepoName('2', 'owner/repo-a'),
        mockGitifyNotificationForRepoName('3', 'owner/repo-b'),
        mockGitifyNotificationForRepoName('4', 'owner/repo-a'),
      ];

      const result = groupNotificationsByRepository(notifications);
      const keys = Array.from(result.keys());

      expect(keys).toEqual(['owner/repo-c', 'owner/repo-a', 'owner/repo-b']);
    });

    it('skips notifications without repository data', () => {
      const notifications: GitifyNotification[] = [
        mockGitifyNotificationForRepoName('1', 'owner/repo-a'),
        mockGitifyNotificationForRepoName('2', null),
        mockGitifyNotificationForRepoName('3', 'owner/repo-a'),
      ];

      const result = groupNotificationsByRepository(notifications);

      expect(result.size).toBe(1);
      expect(result.get('owner/repo-a')?.map((n) => n.id)).toEqual(['1', '3']);
    });

    it('returns empty map when no notifications', () => {
      const notifications: GitifyNotification[] = [];

      const result = groupNotificationsByRepository(notifications);

      expect(result.size).toBe(0);
    });

    it('returns empty map when all notifications lack repository data', () => {
      const notifications: GitifyNotification[] = [
        mockGitifyNotificationForRepoName('1', null),
        mockGitifyNotificationForRepoName('2', null),
      ];

      const result = groupNotificationsByRepository(notifications);

      expect(result.size).toBe(0);
    });
  });

  describe('getFlattenedNotificationsByRepo', () => {
    it('returns repository-grouped order when groupBy is REPOSITORY', () => {
      useSettingsStore.setState({ groupBy: GroupBy.REPOSITORY });

      const notifications: GitifyNotification[] = [
        mockGitifyNotificationForRepoName('1', 'owner/repo-b'),
        mockGitifyNotificationForRepoName('2', 'owner/repo-a'),
        mockGitifyNotificationForRepoName('3', 'owner/repo-b'),
        mockGitifyNotificationForRepoName('4', 'owner/repo-a'),
      ];

      const result = getFlattenedNotificationsByRepo(notifications);

      // First repo-b notifications, then repo-a notifications
      expect(result.map((n) => n.id)).toEqual(['1', '3', '2', '4']);
    });

    it('returns natural account order when groupBy is DATE', () => {
      useSettingsStore.setState({ groupBy: GroupBy.DATE });

      const notifications: GitifyNotification[] = [
        mockGitifyNotificationForRepoName('1', 'owner/repo-b'),
        mockGitifyNotificationForRepoName('2', 'owner/repo-a'),
        mockGitifyNotificationForRepoName('3', 'owner/repo-b'),
      ];

      const result = getFlattenedNotificationsByRepo(notifications);

      // Natural order preserved
      expect(result.map((n) => n.id)).toEqual(['1', '2', '3']);
    });

    it('returns empty array when no notifications', () => {
      useSettingsStore.setState({ groupBy: GroupBy.REPOSITORY });

      const notifications: GitifyNotification[] = [];

      const result = getFlattenedNotificationsByRepo(notifications);

      expect(result).toEqual([]);
    });

    it('handles notifications without repository data when grouped', () => {
      useSettingsStore.setState({ groupBy: GroupBy.REPOSITORY });

      const notifications: GitifyNotification[] = [
        mockGitifyNotificationForRepoName('1', 'owner/repo-a'),
        mockGitifyNotificationForRepoName('2', null),
        mockGitifyNotificationForRepoName('3', 'owner/repo-a'),
      ];

      const result = getFlattenedNotificationsByRepo(notifications);

      // Only notifications with repository data are included when grouped
      expect(result.map((n) => n.id)).toEqual(['1', '3']);
    });

    it('preserves notifications without repository data when not grouped', () => {
      useSettingsStore.setState({ groupBy: GroupBy.DATE });

      const notifications: GitifyNotification[] = [
        mockGitifyNotificationForRepoName('1', 'owner/repo-a'),
        mockGitifyNotificationForRepoName('2', null),
        mockGitifyNotificationForRepoName('3', 'owner/repo-a'),
      ];

      const result = getFlattenedNotificationsByRepo(notifications);

      // All notifications preserved in natural order
      expect(result.map((n) => n.id)).toEqual(['1', '2', '3']);
    });
  });
});
