import { RequestError } from '@octokit/request-error';

import {
  mockGitHubCloudGitifyNotifications,
  mockGithubEnterpriseGitifyNotifications,
} from '../../__mocks__/notifications-mocks';

import type { AccountNotifications } from '../../types';

import { Errors } from '../core/errors';
import { restoreFailedNotifications, settleNotificationActions } from './mutations';

describe('renderer/utils/notifications/mutations.ts', () => {
  describe('settleNotificationActions', () => {
    it('tracks all notifications as succeeded when every action resolves', async () => {
      const notifications = mockGitHubCloudGitifyNotifications;
      const action = vi.fn().mockResolvedValue(undefined);

      const result = await settleNotificationActions(notifications, action);

      expect(result.succeeded).toEqual(notifications);
      expect(result.failed).toEqual([]);
      expect(action).toHaveBeenCalledTimes(notifications.length);
    });

    it('tracks a partial failure within a bulk action independently', async () => {
      const [first, second] = mockGitHubCloudGitifyNotifications;
      const forbiddenError = new RequestError('Forbidden', 403, {
        request: { method: 'GET', url: 'https://api.github.com', headers: {} },
      });

      const action = vi.fn().mockResolvedValueOnce(undefined).mockRejectedValueOnce(forbiddenError);

      const result = await settleNotificationActions([first, second], action);

      expect(result.succeeded).toEqual([first]);
      expect(result.failed).toHaveLength(1);
      expect(result.failed[0].notification).toEqual(second);
      expect(result.failed[0].error).toBe(Errors.ACTION_FORBIDDEN);
      expect(result.failed[0].rawError).toBe(forbiddenError);
    });

    it('classifies each failure independently using determineFailureType', async () => {
      const [first, second] = mockGitHubCloudGitifyNotifications;

      const action = vi
        .fn()
        .mockRejectedValueOnce(
          new RequestError("Missing the 'notifications' scope", 403, {
            request: { method: 'GET', url: 'https://api.github.com', headers: {} },
          }),
        )
        .mockRejectedValueOnce(
          new RequestError('Forbidden', 403, {
            request: { method: 'GET', url: 'https://api.github.com', headers: {} },
          }),
        );

      const result = await settleNotificationActions([first, second], action);

      expect(result.succeeded).toEqual([]);
      expect(result.failed[0].error).toBe(Errors.MISSING_SCOPES);
      expect(result.failed[1].error).toBe(Errors.ACTION_FORBIDDEN);
    });
  });

  describe('restoreFailedNotifications', () => {
    it('returns current data unchanged when there are no failed notifications', () => {
      const current: AccountNotifications[] = [
        { account: mockGitHubCloudGitifyNotifications[0].account, notifications: [], error: null },
      ];

      const result = restoreFailedNotifications([], current, current);

      expect(result).toBe(current);
    });

    it('restores a failed notification back into its account entry, preserving original data', () => {
      const [first, second] = mockGitHubCloudGitifyNotifications;
      const account = first.account;

      const snapshot: AccountNotifications[] = [
        { account, notifications: [first, second], error: null },
      ];

      // `current` simulates both notifications already being absent from
      // this account entry (e.g. removed by a prior cache update).
      const current: AccountNotifications[] = [{ account, notifications: [], error: null }];

      const result = restoreFailedNotifications([second], snapshot, current);

      expect(result[0].notifications).toEqual([second]);
    });

    it('leaves succeeded (still-removed) notifications out and keeps unrelated accounts untouched', () => {
      const [first, second] = mockGitHubCloudGitifyNotifications;
      const account = first.account;
      const otherAccount = mockGithubEnterpriseGitifyNotifications[0].account;

      const snapshot: AccountNotifications[] = [
        { account, notifications: [first, second], error: null },
        {
          account: otherAccount,
          notifications: mockGithubEnterpriseGitifyNotifications,
          error: null,
        },
      ];

      // `first` succeeded (absent from `current`), `second` failed and must
      // be restored from `snapshot`.
      const current: AccountNotifications[] = [
        { account, notifications: [], error: null },
        {
          account: otherAccount,
          notifications: mockGithubEnterpriseGitifyNotifications,
          error: null,
        },
      ];

      const result = restoreFailedNotifications([second], snapshot, current);

      expect(result[0].notifications).toEqual([second]);
      expect(result[1].notifications).toEqual(mockGithubEnterpriseGitifyNotifications);
    });
  });
});
