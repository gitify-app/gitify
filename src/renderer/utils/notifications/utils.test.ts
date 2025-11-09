import { createMockNotificationForRepoName } from '../../__mocks__/notifications-mocks';
import {
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
} from '../../__mocks__/state-mocks';
import type { AccountNotifications } from '../../types';
import { getNewNotifications } from './utils';

describe('renderer/utils/notifications/utils.ts', () => {
  describe('getNewNotifications', () => {
    it('returns all notifications when previous is empty', () => {
      const newNotifications: AccountNotifications[] = [
        {
          account: mockGitHubCloudAccount,
          notifications: [
            createMockNotificationForRepoName('1', 'some/repo'),
            createMockNotificationForRepoName('2', 'some/repo'),
            createMockNotificationForRepoName('3', 'some/repo'),
          ],
          error: null,
        },
      ];

      const result = getNewNotifications([], newNotifications);

      expect(result).toHaveLength(3);
      expect(result.map((n) => n.id)).toEqual(['1', '2', '3']);
    });

    it('returns empty array when new is empty', () => {
      const previousNotifications: AccountNotifications[] = [
        {
          account: mockGitHubCloudAccount,
          notifications: [createMockNotificationForRepoName('1', 'some/repo')],
          error: null,
        },
      ];

      const result = getNewNotifications(previousNotifications, []);

      expect(result).toHaveLength(0);
    });

    it('returns empty array when both are empty', () => {
      const result = getNewNotifications([], []);

      expect(result).toHaveLength(0);
    });

    it('returns only new notifications, filtering out existing ones', () => {
      const previousNotifications: AccountNotifications[] = [
        {
          account: mockGitHubCloudAccount,
          notifications: [
            createMockNotificationForRepoName('1', 'some/repo'),
            createMockNotificationForRepoName('2', 'some/repo'),
          ],
          error: null,
        },
      ];

      const newNotifications: AccountNotifications[] = [
        {
          account: mockGitHubCloudAccount,
          notifications: [
            createMockNotificationForRepoName('2', 'some/repo'),
            createMockNotificationForRepoName('3', 'some/repo'),
            createMockNotificationForRepoName('4', 'some/repo'),
          ],
          error: null,
        },
      ];

      const result = getNewNotifications(
        previousNotifications,
        newNotifications,
      );

      expect(result).toHaveLength(2);
      expect(result.map((n) => n.id)).toEqual(['3', '4']);
    });

    it('returns empty array when all notifications already exist', () => {
      const previousNotifications: AccountNotifications[] = [
        {
          account: mockGitHubCloudAccount,
          notifications: [
            createMockNotificationForRepoName('1', 'some/repo'),
            createMockNotificationForRepoName('2', 'some/repo'),
            createMockNotificationForRepoName('3', 'some/repo'),
          ],
          error: null,
        },
      ];

      const newNotifications: AccountNotifications[] = [
        {
          account: mockGitHubCloudAccount,
          notifications: [
            createMockNotificationForRepoName('1', 'some/repo'),
            createMockNotificationForRepoName('2', 'some/repo'),
            createMockNotificationForRepoName('3', 'some/repo'),
          ],
          error: null,
        },
      ];

      const result = getNewNotifications(
        previousNotifications,
        newNotifications,
      );

      expect(result).toHaveLength(0);
    });

    it('handles multiple accounts correctly', () => {
      const previousNotifications: AccountNotifications[] = [
        {
          account: mockGitHubCloudAccount,
          notifications: [createMockNotificationForRepoName('1', 'some/repo')],
          error: null,
        },
        {
          account: mockGitHubEnterpriseServerAccount,
          notifications: [createMockNotificationForRepoName('10', 'some/repo')],
          error: null,
        },
      ];

      const newNotifications: AccountNotifications[] = [
        {
          account: mockGitHubCloudAccount,
          notifications: [
            createMockNotificationForRepoName('1', 'some/repo'),
            createMockNotificationForRepoName('2', 'some/repo'),
          ],
          error: null,
        },
        {
          account: mockGitHubEnterpriseServerAccount,
          notifications: [
            createMockNotificationForRepoName('10', 'some/repo'),
            createMockNotificationForRepoName('11', 'some/repo'),
          ],
          error: null,
        },
      ];

      const result = getNewNotifications(
        previousNotifications,
        newNotifications,
      );

      expect(result).toHaveLength(2);
      expect(result.map((n) => n.id)).toEqual(['2', '11']);
    });

    it('treats new account as having all new notifications', () => {
      const previousNotifications: AccountNotifications[] = [
        {
          account: mockGitHubCloudAccount,
          notifications: [createMockNotificationForRepoName('1', 'some/repo')],
          error: null,
        },
      ];

      const newNotifications: AccountNotifications[] = [
        {
          account: mockGitHubCloudAccount,
          notifications: [createMockNotificationForRepoName('1', 'some/repo')],
          error: null,
        },
        {
          account: mockGitHubEnterpriseServerAccount,
          notifications: [
            createMockNotificationForRepoName('10', 'some/repo'),
            createMockNotificationForRepoName('11', 'some/repo'),
          ],
          error: null,
        },
      ];

      const result = getNewNotifications(
        previousNotifications,
        newNotifications,
      );

      expect(result).toHaveLength(2);
      expect(result.map((n) => n.id)).toEqual(['10', '11']);
    });

    it('handles account with no notifications', () => {
      const previousNotifications: AccountNotifications[] = [
        {
          account: mockGitHubCloudAccount,
          notifications: [createMockNotificationForRepoName('1', 'some/repo')],
          error: null,
        },
      ];

      const newNotifications: AccountNotifications[] = [
        {
          account: mockGitHubCloudAccount,
          notifications: [],
          error: null,
        },
      ];

      const result = getNewNotifications(
        previousNotifications,
        newNotifications,
      );

      expect(result).toHaveLength(0);
    });

    it('preserves notification order from input', () => {
      const previousNotifications: AccountNotifications[] = [
        {
          account: mockGitHubCloudAccount,
          notifications: [createMockNotificationForRepoName('1', 'some/repo')],
          error: null,
        },
      ];

      const newNotifications: AccountNotifications[] = [
        {
          account: mockGitHubCloudAccount,
          notifications: [
            createMockNotificationForRepoName('5', 'some/repo'),
            createMockNotificationForRepoName('3', 'some/repo'),
            createMockNotificationForRepoName('4', 'some/repo'),
          ],
          error: null,
        },
      ];

      const result = getNewNotifications(
        previousNotifications,
        newNotifications,
      );

      expect(result).toHaveLength(3);
      expect(result.map((n) => n.id)).toEqual(['5', '3', '4']);
    });

    it('handles removed account gracefully', () => {
      const previousNotifications: AccountNotifications[] = [
        {
          account: mockGitHubCloudAccount,
          notifications: [createMockNotificationForRepoName('1', 'some/repo')],
          error: null,
        },
        {
          account: mockGitHubEnterpriseServerAccount,
          notifications: [createMockNotificationForRepoName('10', 'some/repo')],
          error: null,
        },
      ];

      const newNotifications: AccountNotifications[] = [
        {
          account: mockGitHubCloudAccount,
          notifications: [
            createMockNotificationForRepoName('1', 'some/repo'),
            createMockNotificationForRepoName('2', 'some/repo'),
          ],
          error: null,
        },
        // enterprise account removed
      ];

      const result = getNewNotifications(
        previousNotifications,
        newNotifications,
      );

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('handles multiple new notifications across multiple accounts', () => {
      const previousNotifications: AccountNotifications[] = [];

      const newNotifications: AccountNotifications[] = [
        {
          account: mockGitHubCloudAccount,
          notifications: [
            createMockNotificationForRepoName('1', 'some/repo'),
            createMockNotificationForRepoName('2', 'some/repo'),
          ],
          error: null,
        },
        {
          account: mockGitHubEnterpriseServerAccount,
          notifications: [
            createMockNotificationForRepoName('10', 'some/repo'),
            createMockNotificationForRepoName('11', 'some/repo'),
          ],
          error: null,
        },
      ];

      const result = getNewNotifications(
        previousNotifications,
        newNotifications,
      );

      expect(result).toHaveLength(4);
      expect(result.map((n) => n.id)).toEqual(['1', '2', '10', '11']);
    });
  });
});
