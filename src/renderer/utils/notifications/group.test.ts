import { createMockNotificationForRepoName } from '../../__mocks__/notifications-mocks';
import { mockSettings } from '../../__mocks__/state-mocks';
import type { GitifyNotification } from '../../types';
import { GroupBy } from '../../types';
import {
  getFlattenedNotificationsByRepo,
  groupNotificationsByRepository,
  isGroupByRepository,
} from './group';

describe('renderer/utils/notifications/group.ts', () => {
  describe('isGroupByRepository', () => {
    it('returns true when groupBy is REPOSITORY', () => {
      const settings = { ...mockSettings, groupBy: GroupBy.REPOSITORY };
      expect(isGroupByRepository(settings)).toBe(true);
    });

    it('returns false when groupBy is DATE', () => {
      const settings = { ...mockSettings, groupBy: GroupBy.DATE };
      expect(isGroupByRepository(settings)).toBe(false);
    });
  });

  describe('groupNotificationsByRepository', () => {
    it('groups notifications by repository fullName', () => {
      const notifications: GitifyNotification[] = [
        createMockNotificationForRepoName('1', 'owner/repo-a'),
        createMockNotificationForRepoName('2', 'owner/repo-b'),
        createMockNotificationForRepoName('3', 'owner/repo-a'),
      ];

      const result = groupNotificationsByRepository(notifications);

      expect(result.size).toBe(2);
      expect(result.get('owner/repo-a')?.map((n) => n.id)).toEqual(['1', '3']);
      expect(result.get('owner/repo-b')?.map((n) => n.id)).toEqual(['2']);
    });

    it('preserves first-seen repository order', () => {
      const notifications: GitifyNotification[] = [
        createMockNotificationForRepoName('1', 'owner/repo-c'),
        createMockNotificationForRepoName('2', 'owner/repo-a'),
        createMockNotificationForRepoName('3', 'owner/repo-b'),
        createMockNotificationForRepoName('4', 'owner/repo-a'),
      ];

      const result = groupNotificationsByRepository(notifications);
      const keys = Array.from(result.keys());

      expect(keys).toEqual(['owner/repo-c', 'owner/repo-a', 'owner/repo-b']);
    });

    it('skips notifications without repository data', () => {
      const notifications: GitifyNotification[] = [
        createMockNotificationForRepoName('1', 'owner/repo-a'),
        createMockNotificationForRepoName('2', null),
        createMockNotificationForRepoName('3', 'owner/repo-a'),
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
        createMockNotificationForRepoName('1', null),
        createMockNotificationForRepoName('2', null),
      ];

      const result = groupNotificationsByRepository(notifications);

      expect(result.size).toBe(0);
    });
  });

  describe('getFlattenedNotificationsByRepo', () => {
    it('returns repository-grouped order when groupBy is REPOSITORY', () => {
      const settings = { ...mockSettings, groupBy: GroupBy.REPOSITORY };
      const notifications: GitifyNotification[] = [
        createMockNotificationForRepoName('1', 'owner/repo-b'),
        createMockNotificationForRepoName('2', 'owner/repo-a'),
        createMockNotificationForRepoName('3', 'owner/repo-b'),
        createMockNotificationForRepoName('4', 'owner/repo-a'),
      ];

      const result = getFlattenedNotificationsByRepo(notifications, settings);

      // First repo-b notifications, then repo-a notifications
      expect(result.map((n) => n.id)).toEqual(['1', '3', '2', '4']);
    });

    it('returns natural account order when groupBy is DATE', () => {
      const settings = { ...mockSettings, groupBy: GroupBy.DATE };
      const notifications: GitifyNotification[] = [
        createMockNotificationForRepoName('1', 'owner/repo-b'),
        createMockNotificationForRepoName('2', 'owner/repo-a'),
        createMockNotificationForRepoName('3', 'owner/repo-b'),
      ];

      const result = getFlattenedNotificationsByRepo(notifications, settings);

      // Natural order preserved
      expect(result.map((n) => n.id)).toEqual(['1', '2', '3']);
    });

    it('returns empty array when no notifications', () => {
      const settings = { ...mockSettings, groupBy: GroupBy.REPOSITORY };
      const notifications: GitifyNotification[] = [];

      const result = getFlattenedNotificationsByRepo(notifications, settings);

      expect(result).toEqual([]);
    });

    it('handles notifications without repository data when grouped', () => {
      const settings = { ...mockSettings, groupBy: GroupBy.REPOSITORY };
      const notifications: GitifyNotification[] = [
        createMockNotificationForRepoName('1', 'owner/repo-a'),
        createMockNotificationForRepoName('2', null),
        createMockNotificationForRepoName('3', 'owner/repo-a'),
      ];

      const result = getFlattenedNotificationsByRepo(notifications, settings);

      // Only notifications with repository data are included when grouped
      expect(result.map((n) => n.id)).toEqual(['1', '3']);
    });

    it('preserves notifications without repository data when not grouped', () => {
      const settings = { ...mockSettings, groupBy: GroupBy.DATE };
      const notifications: GitifyNotification[] = [
        createMockNotificationForRepoName('1', 'owner/repo-a'),
        createMockNotificationForRepoName('2', null),
        createMockNotificationForRepoName('3', 'owner/repo-a'),
      ];

      const result = getFlattenedNotificationsByRepo(notifications, settings);

      // All notifications preserved in natural order
      expect(result.map((n) => n.id)).toEqual(['1', '2', '3']);
    });
  });
});
