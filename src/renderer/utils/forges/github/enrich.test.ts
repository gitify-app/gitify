import { mockPartialGitifyNotification } from '../../../__mocks__/notifications-mocks';

import type { GitifyRepository, Link } from '../../../types';

import * as logger from '../../core/logger';
import * as client from './client';
import { enrichGitHubNotifications } from './enrich';

vi.mock('./client', async () => {
  const actual = await vi.importActual<typeof import('./client')>('./client');
  return {
    ...actual,
    fetchNotificationDetailsForList: vi.fn(),
    fetchIssueByNumber: vi.fn(),
  };
});

describe('renderer/utils/forges/github/enrich.ts', () => {
  it('logs and continues when a per-notification handler throws', async () => {
    const rendererLogErrorSpy = vi.spyOn(logger, 'rendererLogError').mockImplementation(vi.fn());
    const rendererLogWarnSpy = vi.spyOn(logger, 'rendererLogWarn').mockImplementation(vi.fn());

    // No batched fragments — each handler will fall back to its single-fetch
    // path, which we make fail.
    vi.mocked(client.fetchNotificationDetailsForList).mockResolvedValue(new Map());

    const mockError = new Error('Test error');
    const mockNotification = mockPartialGitifyNotification({
      title: 'This issue will throw an error',
      type: 'Issue',
      url: 'https://api.github.com/repos/gitify-app/notifications-test/issues/1' as Link,
    });
    const mockRepository: GitifyRepository = {
      name: 'notifications-test',
      fullName: 'gitify-app/notifications-test',
      htmlUrl: 'https://github.com/gitify-app/notifications-test' as Link,
      owner: {
        login: 'gitify-app',
        avatarUrl: 'https://avatars.githubusercontent.com/u/133795385?s=200&v=4' as Link,
        type: 'Organization',
      },
    };
    mockNotification.repository = mockRepository;

    vi.mocked(client.fetchIssueByNumber).mockRejectedValue(mockError);

    const [result] = await enrichGitHubNotifications([mockNotification]);

    expect(result).toBeDefined();
    expect(rendererLogErrorSpy).toHaveBeenCalledWith(
      'enrichGitHubNotifications',
      'failed to enrich notification details for',
      mockError,
      mockNotification,
    );
    expect(rendererLogWarnSpy).toHaveBeenCalledWith(
      'enrichGitHubNotifications',
      'Continuing with base notification details',
    );
  });

  it('preserves the original subject reference only when enrichment fails', async () => {
    vi.spyOn(logger, 'rendererLogError').mockImplementation(vi.fn());
    vi.spyOn(logger, 'rendererLogWarn').mockImplementation(vi.fn());

    vi.mocked(client.fetchNotificationDetailsForList).mockResolvedValue(new Map());

    const failingNotification = mockPartialGitifyNotification({
      title: 'This issue will fail to enrich',
      type: 'Issue',
      url: 'https://api.github.com/repos/gitify-app/notifications-test/issues/1' as Link,
    });
    const succeedingNotification = mockPartialGitifyNotification({
      title: 'This issue will enrich',
      type: 'Issue',
      url: 'https://api.github.com/repos/gitify-app/notifications-test/issues/2' as Link,
    });

    vi.mocked(client.fetchIssueByNumber)
      .mockRejectedValueOnce(new Error('Test error'))
      .mockResolvedValueOnce({ repository: {} } as never);

    const [failed, succeeded] = await enrichGitHubNotifications([
      failingNotification,
      succeedingNotification,
    ]);

    // Adapter contract: a failed enrichment keeps the original `subject`
    // reference so callers can detect it; a completed one returns a new one.
    expect(failed.subject).toBe(failingNotification.subject);
    expect(succeeded.subject).not.toBe(succeedingNotification.subject);
  });
});
