import {
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
} from '../../__mocks__/account-mocks';
import {
  mockGitifyNotificationForRepoName,
  mockPartialGitifyNotification,
  mockSingleAccountNotifications,
} from '../../__mocks__/notifications-mocks';

import { useSettingsStore } from '../../stores';

import {
  type AccountNotifications,
  type GitifyNotification,
  GroupBy,
  type Link,
} from '../../types';

import * as apiClient from '../forges/github/client';
import { GITHUB_API_MERGE_BATCH_SIZE } from '../forges/github/enrich';
import {
  enrichNotifications,
  getNotificationCount,
  getUnreadNotificationCount,
  stabilizeNotificationsOrder,
} from './notifications';

vi.mock('../forges/github/client', async () => {
  const actual =
    await vi.importActual<typeof import('../forges/github/client')>('../forges/github/client');
  return {
    ...actual,
    fetchNotificationDetailsForList: vi.fn(),
    fetchIssueByNumber: vi.fn(),
  };
});

describe('renderer/utils/notifications/notifications.ts', () => {
  beforeEach(() => {
    vi.mocked(apiClient.fetchNotificationDetailsForList).mockReset();
    vi.mocked(apiClient.fetchNotificationDetailsForList).mockResolvedValue(new Map());
    vi.mocked(apiClient.fetchIssueByNumber).mockReset();
  });

  it('getNotificationCount', () => {
    const result = getNotificationCount(mockSingleAccountNotifications);

    expect(result).toBe(1);
  });

  it('getUnreadNotificationCount', () => {
    const result = getUnreadNotificationCount(mockSingleAccountNotifications);

    expect(result).toBe(1);
  });

  describe('stabilizeNotificationsOrder', () => {
    const acc1: AccountNotifications = {
      account: mockGitHubCloudAccount,
      notifications: [
        mockGitifyNotificationForRepoName('a1', 'owner/repo-1'),
        mockGitifyNotificationForRepoName('a2', 'owner/repo-2'),
        mockGitifyNotificationForRepoName('a3', 'owner/repo-1'),
      ],
      error: null,
    };

    const acc2: AccountNotifications = {
      account: mockGitHubEnterpriseServerAccount,
      notifications: [
        mockGitifyNotificationForRepoName('b1', 'owner/repo-3'),
        mockGitifyNotificationForRepoName('b2', 'owner/repo-4'),
        mockGitifyNotificationForRepoName('b3', 'owner/repo-3'),
      ],
      error: null,
    };

    const mockAccounts: AccountNotifications[] = [acc1, acc2];

    it('assigns sequential order across all notifications when not grouped (DATE)', () => {
      useSettingsStore.setState({ groupBy: GroupBy.DATE });

      stabilizeNotificationsOrder(mockAccounts);

      expect(mockAccounts.flatMap((acc) => acc.notifications).map((n) => n.order)).toEqual([
        0, 1, 2, 3, 4, 5,
      ]);
    });

    it('groups by repository when REPOSITORY and assigns order in first-seen repo groups', () => {
      useSettingsStore.setState({ groupBy: GroupBy.REPOSITORY });

      stabilizeNotificationsOrder(mockAccounts);

      expect(mockAccounts.flatMap((acc) => acc.notifications).map((n) => n.order)).toEqual([
        0, 2, 1, 3, 5, 4,
      ]);
    });
  });

  describe('enrichNotifications', () => {
    it('should skip enrichment when detailedNotifications is false', async () => {
      const notification = mockPartialGitifyNotification({
        title: 'Issue #1',
        type: 'Issue',
        url: 'https://api.github.com/repos/gitify-app/notifications-test/issues/1' as Link,
      }) as GitifyNotification;
      useSettingsStore.setState({ detailedNotifications: false });

      const result = await enrichNotifications([notification]);

      expect(result).toEqual([notification]);
    });

    it('should return notifications when all types do not support merge query', async () => {
      // CheckSuite types don't support merge query and have no URL
      const notification = mockPartialGitifyNotification({
        title: 'CI workflow run',
        type: 'CheckSuite',
        url: null,
      }) as GitifyNotification;
      useSettingsStore.setState({ detailedNotifications: true });

      const result = await enrichNotifications([notification]);

      expect(result).toHaveLength(1);
      expect(result[0].subject.title).toBe('CI workflow run');
      expect(apiClient.fetchNotificationDetailsForList).not.toHaveBeenCalled();
    });

    it('should handle empty notifications array', async () => {
      useSettingsStore.setState({ detailedNotifications: true });

      const result = await enrichNotifications([]);

      expect(result).toEqual([]);
      expect(apiClient.fetchNotificationDetailsForList).not.toHaveBeenCalled();
    });

    it('should batch notifications by GITHUB_API_MERGE_BATCH_SIZE', async () => {
      const fetchNotificationDetailsForListSpy = vi.mocked(
        apiClient.fetchNotificationDetailsForList,
      );
      vi.mocked(apiClient.fetchIssueByNumber).mockResolvedValue({ repository: {} } as never);
      fetchNotificationDetailsForListSpy.mockResolvedValue(new Map());

      const notificationCount = GITHUB_API_MERGE_BATCH_SIZE * 2.5;
      const notifications = Array.from({ length: notificationCount }, (_, i) =>
        mockPartialGitifyNotification({
          title: `Notification ${i}`,
          type: 'Issue',
          url: `https://api.github.com/repos/gitify-app/notifications-test/issues/${i}` as Link,
        }),
      ) as GitifyNotification[];

      useSettingsStore.setState({ detailedNotifications: true });

      await enrichNotifications(notifications);

      // Should be called 3 times: batches of 100, 100, 50
      expect(fetchNotificationDetailsForListSpy).toHaveBeenCalledTimes(3);

      // Verify batch sizes
      expect(fetchNotificationDetailsForListSpy.mock.calls[0][0]).toHaveLength(
        GITHUB_API_MERGE_BATCH_SIZE,
      );
      expect(fetchNotificationDetailsForListSpy.mock.calls[1][0]).toHaveLength(
        GITHUB_API_MERGE_BATCH_SIZE,
      );
      expect(fetchNotificationDetailsForListSpy.mock.calls[2][0]).toHaveLength(50);
    });

    it('should handle single batch of notifications', async () => {
      const fetchNotificationDetailsForListSpy = vi.mocked(
        apiClient.fetchNotificationDetailsForList,
      );
      vi.mocked(apiClient.fetchIssueByNumber).mockResolvedValue({ repository: {} } as never);
      fetchNotificationDetailsForListSpy.mockResolvedValue(new Map());

      const notifications = Array.from({ length: 50 }, (_, i) =>
        mockPartialGitifyNotification({
          title: `Notification ${i}`,
          type: 'Issue',
          url: `https://api.github.com/repos/gitify-app/notifications-test/issues/${i}` as Link,
        }),
      ) as GitifyNotification[];

      useSettingsStore.setState({ detailedNotifications: true });

      await enrichNotifications(notifications);

      // Should be called once for single batch
      expect(fetchNotificationDetailsForListSpy).toHaveBeenCalledTimes(1);
      expect(fetchNotificationDetailsForListSpy.mock.calls[0][0]).toHaveLength(50);
    });
  });
});
