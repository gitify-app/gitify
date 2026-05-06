import { mockGitHubCloudAccount } from '../../../__mocks__/account-mocks';

import type { RawGitHubNotification } from './types';

import { transformNotifications } from './transform';

describe('renderer/utils/forges/github/transform.ts', () => {
  function rawNotification(
    overrides: Partial<RawGitHubNotification> = {},
  ): RawGitHubNotification {
    return {
      id: '1',
      unread: true,
      updated_at: '2024-01-01T00:00:00Z',
      last_read_at: null,
      reason: 'subscribed',
      subscription_url: 'https://api.github.com/x',
      url: 'https://api.github.com/notifications/threads/1',
      subject: {
        title: 'Issue title',
        type: 'Issue',
        url: 'https://api.github.com/repos/o/r/issues/1',
        latest_comment_url:
          'https://api.github.com/repos/o/r/issues/comments/2',
      },
      repository: {
        id: 1,
        node_id: 'n',
        name: 'r',
        full_name: 'o/r',
        private: false,
        url: 'https://api.github.com/repos/o/r',
        html_url: 'https://github.com/o/r',
        description: null,
        fork: false,
        archive_url: '',
        assignees_url: '',
        blobs_url: '',
        branches_url: '',
        collaborators_url: '',
        comments_url: '',
        commits_url: '',
        compare_url: '',
        contents_url: '',
        contributors_url: '',
        deployments_url: '',
        downloads_url: '',
        events_url: '',
        forks_url: '',
        git_commits_url: '',
        git_refs_url: '',
        git_tags_url: '',
        hooks_url: '',
        issue_comment_url: '',
        issue_events_url: '',
        issues_url: '',
        keys_url: '',
        labels_url: '',
        languages_url: '',
        merges_url: '',
        milestones_url: '',
        notifications_url: '',
        pulls_url: '',
        releases_url: '',
        stargazers_url: '',
        statuses_url: '',
        subscribers_url: '',
        subscription_url: '',
        tags_url: '',
        teams_url: '',
        trees_url: '',
        owner: {
          login: 'o',
          id: 1,
          node_id: 'n',
          avatar_url: 'https://github.com/o.png',
          gravatar_id: '',
          url: '',
          html_url: 'https://github.com/o',
          followers_url: '',
          following_url: '',
          gists_url: '',
          starred_url: '',
          subscriptions_url: '',
          organizations_url: '',
          repos_url: '',
          events_url: '',
          received_events_url: '',
          type: 'User',
          site_admin: false,
          user_view_type: 'public',
        },
      },
      ...overrides,
    } as unknown as RawGitHubNotification;
  }

  it('maps a raw notification onto the GitifyNotification shape', () => {
    const [n] = transformNotifications(
      [rawNotification()],
      mockGitHubCloudAccount,
    );

    expect(n.id).toBe('1');
    expect(n.unread).toBe(true);
    expect(n.updatedAt).toBe('2024-01-01T00:00:00Z');
    expect(n.subject.title).toBe('Issue title');
    expect(n.subject.type).toBe('Issue');
    expect(n.subject.url).toBe('https://api.github.com/repos/o/r/issues/1');
    expect(n.repository.fullName).toBe('o/r');
    expect(n.repository.htmlUrl).toBe('https://github.com/o/r');
    expect(n.repository.owner).toEqual({
      login: 'o',
      avatarUrl: 'https://github.com/o.png',
      type: 'User',
    });
    expect(n.account).toBe(mockGitHubCloudAccount);
    expect(n.order).toBe(0);
  });

  it('carries the reason code and resolves details from the catalog', () => {
    const [n] = transformNotifications(
      [rawNotification({ reason: 'mention' })],
      mockGitHubCloudAccount,
    );

    expect(n.reason.code).toBe('mention');
    expect(n.reason.title).toBeTruthy();
    expect(typeof n.reason.description).toBe('string');
  });

  it('preserves a null latest_comment_url', () => {
    const raw = rawNotification();
    raw.subject = { ...raw.subject, latest_comment_url: null };

    const [n] = transformNotifications([raw], mockGitHubCloudAccount);

    expect(n.subject.latestCommentUrl).toBeNull();
  });

  it('returns an empty array when given no notifications', () => {
    expect(transformNotifications([], mockGitHubCloudAccount)).toEqual([]);
  });
});
