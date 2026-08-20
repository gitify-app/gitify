import { mockGitHubCloudAccount } from '../../../../__mocks__/account-mocks';
import { mockPartialGitifyNotification } from '../../../../__mocks__/notifications-mocks';
import {
  mockAuthor,
  mockAuthorResponseNode,
  mockCommenter,
  mockPullRequestResponseNode,
  noReactionGroups,
} from '../__mocks__/response-mocks';

import type { GitifyNotification } from '../../../../types';
import {
  type GitifyPullRequestState,
  type GitifySubject,
  IconColor,
  type Link,
} from '../../../../types';

import * as apiClient from '../client';
import type {
  FetchPullRequestByNumberQuery,
  PullRequestReviewState,
} from '../graphql/generated/graphql';
import {
  getClosestPullRequestActivity,
  getReviewRequestTypes,
  getPullRequestReviewers,
  pullRequestHandler,
} from './pullRequest';

vi.mock('../client', async () => {
  const actual = await vi.importActual<typeof import('../client')>('../client');
  return {
    ...actual,
    fetchPullByNumber: vi.fn(),
  };
});

describe('renderer/utils/notifications/handlers/pullRequest.ts', () => {
  describe('mergeQueryConfig', () => {
    describe('supportsMergedQueryEnrichment', () => {
      it('should support merge query', () => {
        expect(pullRequestHandler.supportsMergedQueryEnrichment).toBeTruthy();
      });
    });
  });

  describe('enrich', () => {
    const fetchPullByNumberSpy = vi.mocked(apiClient.fetchPullByNumber);

    const mockNotification = mockPartialGitifyNotification({
      title: 'This is a mock pull request',
      type: 'PullRequest',
      url: 'https://api.github.com/repos/gitify-app/notifications-test/pulls/1' as Link,
      latestCommentUrl:
        'https://api.github.com/repos/gitify-app/notifications-test/issues/comments/302888448' as Link,
    });

    it('pull request with state', async () => {
      const mockPullRequest = mockPullRequestResponseNode({ state: 'CLOSED' });

      fetchPullByNumberSpy.mockResolvedValue({
        repository: {
          pullRequest: mockPullRequest,
        },
      } satisfies FetchPullRequestByNumberQuery);

      const result = await pullRequestHandler.enrich(mockNotification);

      expect(result).toEqual({
        number: 123,
        state: 'CLOSED',
        user: {
          login: mockAuthor.login,
          avatarUrl: mockAuthor.avatarUrl,
          htmlUrl: mockAuthor.htmlUrl,
          type: mockAuthor.type,
        },
        author: {
          login: mockAuthor.login,
          avatarUrl: mockAuthor.avatarUrl,
          htmlUrl: mockAuthor.htmlUrl,
          type: mockAuthor.type,
        },
        reviewRequested: [],
        reviewers: [],
        labels: [],
        linkedIssues: [],
        commentCount: 0,
        milestone: undefined,
        htmlUrl: 'https://github.com/gitify-app/notifications-test/pulls/123' as Link,
        reactionsCount: 0,
        reactionGroups: noReactionGroups,
      } satisfies Partial<GitifySubject>);
    });

    it('enriches review thread status and activity', async () => {
      const mockPullRequest = mockPullRequestResponseNode({ state: 'OPEN' });
      mockPullRequest.reviewThreads = {
        nodes: [
          {
            isResolved: false,
            comments: { nodes: [{ author: { login: 'reviewer-1' } }] },
          },
          {
            isResolved: true,
            comments: { nodes: [{ author: null }] },
          },
        ],
      };

      fetchPullByNumberSpy.mockResolvedValue({
        repository: { pullRequest: mockPullRequest },
      } satisfies FetchPullRequestByNumberQuery);

      const result = await pullRequestHandler.enrich(mockNotification);

      expect(result.reviewers).toEqual([
        { user: 'reviewer-1', threads: { resolved: 0, total: 1 } },
        { user: 'Unknown reviewer', threads: { resolved: 1, total: 1 } },
      ]);
    });

    it('draft pull request state', async () => {
      const mockPullRequest = mockPullRequestResponseNode({
        state: 'OPEN',
        isDraft: true,
      });

      fetchPullByNumberSpy.mockResolvedValue({
        repository: {
          pullRequest: mockPullRequest,
        },
      } satisfies FetchPullRequestByNumberQuery);

      const result = await pullRequestHandler.enrich(mockNotification);

      expect(result).toEqual({
        number: 123,
        state: 'DRAFT',
        user: {
          login: mockAuthor.login,
          avatarUrl: mockAuthor.avatarUrl,
          htmlUrl: mockAuthor.htmlUrl,
          type: mockAuthor.type,
        },
        author: {
          login: mockAuthor.login,
          avatarUrl: mockAuthor.avatarUrl,
          htmlUrl: mockAuthor.htmlUrl,
          type: mockAuthor.type,
        },
        reviewRequested: [],
        reviewers: [],
        labels: [],
        linkedIssues: [],
        commentCount: 0,
        milestone: undefined,
        htmlUrl: 'https://github.com/gitify-app/notifications-test/pulls/123' as Link,
        reactionsCount: 0,
        reactionGroups: noReactionGroups,
      } satisfies Partial<GitifySubject>);
    });

    it('merge queue pull request state', async () => {
      const mockPullRequest = mockPullRequestResponseNode({
        state: 'OPEN',
        isInMergeQueue: true,
      });

      fetchPullByNumberSpy.mockResolvedValue({
        repository: {
          pullRequest: mockPullRequest,
        },
      } satisfies FetchPullRequestByNumberQuery);

      const result = await pullRequestHandler.enrich(mockNotification);

      expect(result).toEqual({
        number: 123,
        state: 'MERGE_QUEUE',
        user: {
          login: mockAuthor.login,
          avatarUrl: mockAuthor.avatarUrl,
          htmlUrl: mockAuthor.htmlUrl,
          type: mockAuthor.type,
        },
        author: {
          login: mockAuthor.login,
          avatarUrl: mockAuthor.avatarUrl,
          htmlUrl: mockAuthor.htmlUrl,
          type: mockAuthor.type,
        },
        reviewRequested: [],
        reviewers: [],
        labels: [],
        linkedIssues: [],
        commentCount: 0,
        milestone: undefined,
        htmlUrl: 'https://github.com/gitify-app/notifications-test/pulls/123' as Link,
        reactionsCount: 0,
        reactionGroups: noReactionGroups,
      } satisfies Partial<GitifySubject>);
    });

    it('merged pull request state', async () => {
      const mockPullRequest = mockPullRequestResponseNode({
        state: 'MERGED',
        merged: true,
      });

      fetchPullByNumberSpy.mockResolvedValue({
        repository: {
          pullRequest: mockPullRequest,
        },
      } satisfies FetchPullRequestByNumberQuery);

      const result = await pullRequestHandler.enrich(mockNotification);

      expect(result).toEqual({
        number: 123,
        state: 'MERGED',
        user: {
          login: mockAuthor.login,
          avatarUrl: mockAuthor.avatarUrl,
          htmlUrl: mockAuthor.htmlUrl,
          type: mockAuthor.type,
        },
        author: {
          login: mockAuthor.login,
          avatarUrl: mockAuthor.avatarUrl,
          htmlUrl: mockAuthor.htmlUrl,
          type: mockAuthor.type,
        },
        reviewRequested: [],
        reviewers: [],
        labels: [],
        linkedIssues: [],
        commentCount: 0,
        milestone: undefined,
        htmlUrl: 'https://github.com/gitify-app/notifications-test/pulls/123' as Link,
        reactionsCount: 0,
        reactionGroups: noReactionGroups,
      } satisfies Partial<GitifySubject>);
    });

    it('pull request that is part of a native stacked PR series', async () => {
      const mockPullRequest = mockPullRequestResponseNode({ state: 'OPEN' });
      mockPullRequest.stackEntry = {
        position: 2,
        stack: {
          size: 3,
        },
      };

      fetchPullByNumberSpy.mockResolvedValue({
        repository: {
          pullRequest: mockPullRequest,
        },
      } satisfies FetchPullRequestByNumberQuery);

      const result = await pullRequestHandler.enrich(mockNotification);

      expect(result).toEqual({
        number: 123,
        state: 'OPEN',
        user: {
          login: mockAuthor.login,
          avatarUrl: mockAuthor.avatarUrl,
          htmlUrl: mockAuthor.htmlUrl,
          type: mockAuthor.type,
        },
        author: {
          login: mockAuthor.login,
          avatarUrl: mockAuthor.avatarUrl,
          htmlUrl: mockAuthor.htmlUrl,
          type: mockAuthor.type,
        },
        reviewRequested: [],
        reviewers: [],
        labels: [],
        isStacked: true,
        stackPosition: 2,
        stackDepth: 3,
        linkedIssues: [],
        commentCount: 0,
        milestone: undefined,
        htmlUrl: 'https://github.com/gitify-app/notifications-test/pulls/123' as Link,
        reactionsCount: 0,
        reactionGroups: noReactionGroups,
      } satisfies Partial<GitifySubject>);
    });

    it('with comments', async () => {
      const mockPullRequest = mockPullRequestResponseNode({
        state: 'OPEN',
      });
      mockPullRequest.comments = {
        totalCount: 1,
        nodes: [
          {
            author: mockCommenter,
            updatedAt: mockNotification.updatedAt,
            url: 'https://github.com/gitify-app/notifications-test/pulls/123#issuecomment-1234' as Link,
            reactions: {
              totalCount: 0,
            },
            reactionGroups: noReactionGroups,
          },
        ],
      };

      fetchPullByNumberSpy.mockResolvedValue({
        repository: {
          pullRequest: mockPullRequest,
        },
      } satisfies FetchPullRequestByNumberQuery);

      const result = await pullRequestHandler.enrich(mockNotification);

      expect(result).toEqual({
        number: 123,
        state: 'OPEN',
        user: {
          login: mockCommenter.login,
          avatarUrl: mockCommenter.avatarUrl,
          htmlUrl: mockCommenter.htmlUrl,
          type: mockCommenter.type,
        },
        author: {
          login: mockAuthor.login,
          avatarUrl: mockAuthor.avatarUrl,
          htmlUrl: mockAuthor.htmlUrl,
          type: mockAuthor.type,
        },
        commenter: {
          login: mockCommenter.login,
          avatarUrl: mockCommenter.avatarUrl,
          htmlUrl: mockCommenter.htmlUrl,
          type: mockCommenter.type,
        },
        reviewRequested: [],
        reviewers: [],
        labels: [],
        linkedIssues: [],
        commentCount: 1,
        milestone: undefined,
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/pulls/123#issuecomment-1234' as Link,
        reactionsCount: 0,
        reactionGroups: noReactionGroups,
      } satisfies Partial<GitifySubject>);
    });

    it('selects a Copilot review after an earlier Actions comment', async () => {
      const mockPullRequest = mockPullRequestResponseNode({ state: 'OPEN' });
      const actionsAuthor = {
        ...mockAuthorResponseNode('github-actions'),
        htmlUrl: 'https://github.com/apps/github-actions' as Link,
        type: 'Bot' as const,
      };
      const copilotAuthor = {
        ...mockAuthorResponseNode('copilot-pull-request-reviewer'),
        htmlUrl: 'https://github.com/apps/copilot-pull-request-reviewer' as Link,
        type: 'Bot' as const,
      };
      mockPullRequest.comments = {
        totalCount: 1,
        nodes: [
          {
            author: actionsAuthor,
            updatedAt: '2026-01-01T16:55:00Z',
            url: 'https://github.com/example/repo/pull/123#issuecomment-1' as Link,
            reactions: { totalCount: 2 },
            reactionGroups: noReactionGroups,
          },
        ],
      };
      mockPullRequest.reviews = {
        totalCount: 1,
        nodes: [
          {
            author: copilotAuthor,
            state: 'COMMENTED',
            submittedAt: '2026-01-01T16:59:59Z',
            url: 'https://github.com/example/repo/pull/123#pullrequestreview-1' as Link,
          },
        ],
      };
      fetchPullByNumberSpy.mockResolvedValue({
        repository: { pullRequest: mockPullRequest },
      } satisfies FetchPullRequestByNumberQuery);

      const result = await pullRequestHandler.enrich(mockNotification);

      expect(result.user).toEqual({
        login: copilotAuthor.login,
        avatarUrl: copilotAuthor.avatarUrl,
        htmlUrl: copilotAuthor.htmlUrl,
        type: copilotAuthor.type,
      });
      expect(result.htmlUrl).toBe('https://github.com/example/repo/pull/123#pullrequestreview-1');
      expect(result.reactionsCount).toBe(0);
    });

    it('with labels', async () => {
      const mockPullRequest = mockPullRequestResponseNode({
        state: 'OPEN',
      });
      mockPullRequest.labels = {
        nodes: [
          {
            name: 'enhancement',
            color: '0e8a16',
          },
        ],
      };

      fetchPullByNumberSpy.mockResolvedValue({
        repository: {
          pullRequest: mockPullRequest,
        },
      } satisfies FetchPullRequestByNumberQuery);

      const result = await pullRequestHandler.enrich(mockNotification);

      expect(result).toEqual({
        number: 123,
        state: 'OPEN',
        user: {
          login: mockAuthor.login,
          avatarUrl: mockAuthor.avatarUrl,
          htmlUrl: mockAuthor.htmlUrl,
          type: mockAuthor.type,
        },
        author: {
          login: mockAuthor.login,
          avatarUrl: mockAuthor.avatarUrl,
          htmlUrl: mockAuthor.htmlUrl,
          type: mockAuthor.type,
        },
        reviewRequested: [],
        reviewers: [],
        labels: [{ name: 'enhancement', color: '0e8a16' }],
        linkedIssues: [],
        commentCount: 0,
        milestone: undefined,
        htmlUrl: 'https://github.com/gitify-app/notifications-test/pulls/123' as Link,
        reactionsCount: 0,
        reactionGroups: noReactionGroups,
      } satisfies Partial<GitifySubject>);
    });

    it('with linked issues', async () => {
      const mockPullRequest = mockPullRequestResponseNode({
        state: 'OPEN',
      });
      mockPullRequest.closingIssuesReferences = {
        nodes: [
          {
            number: 789,
          },
        ],
      };

      fetchPullByNumberSpy.mockResolvedValue({
        repository: {
          pullRequest: mockPullRequest,
        },
      } satisfies FetchPullRequestByNumberQuery);

      const result = await pullRequestHandler.enrich(mockNotification);

      expect(result).toEqual({
        number: 123,
        state: 'OPEN',
        user: {
          login: mockAuthor.login,
          avatarUrl: mockAuthor.avatarUrl,
          htmlUrl: mockAuthor.htmlUrl,
          type: mockAuthor.type,
        },
        author: {
          login: mockAuthor.login,
          avatarUrl: mockAuthor.avatarUrl,
          htmlUrl: mockAuthor.htmlUrl,
          type: mockAuthor.type,
        },
        reviewRequested: [],
        reviewers: [],
        labels: [],
        linkedIssues: ['#789'],
        commentCount: 0,
        milestone: undefined,
        htmlUrl: 'https://github.com/gitify-app/notifications-test/pulls/123' as Link,
        reactionsCount: 0,
        reactionGroups: noReactionGroups,
      } satisfies Partial<GitifySubject>);
    });

    it('with milestone', async () => {
      const mockPullRequest = mockPullRequestResponseNode({
        state: 'OPEN',
      });
      mockPullRequest.milestone = {
        state: 'OPEN',
        title: 'Open Milestone',
      };

      fetchPullByNumberSpy.mockResolvedValue({
        repository: {
          pullRequest: mockPullRequest,
        },
      } satisfies FetchPullRequestByNumberQuery);

      const result = await pullRequestHandler.enrich(mockNotification);

      expect(result).toEqual({
        number: 123,
        state: 'OPEN',
        user: {
          login: mockAuthor.login,
          avatarUrl: mockAuthor.avatarUrl,
          htmlUrl: mockAuthor.htmlUrl,
          type: mockAuthor.type,
        },
        author: {
          login: mockAuthor.login,
          avatarUrl: mockAuthor.avatarUrl,
          htmlUrl: mockAuthor.htmlUrl,
          type: mockAuthor.type,
        },
        reviewRequested: [],
        reviewers: [],
        labels: [],
        linkedIssues: [],
        commentCount: 0,
        milestone: {
          state: 'OPEN',
          title: 'Open Milestone',
        },
        htmlUrl: 'https://github.com/gitify-app/notifications-test/pulls/123' as Link,
        reactionsCount: 0,
        reactionGroups: noReactionGroups,
      } satisfies Partial<GitifySubject>);
    });
  });

  describe('getClosestPullRequestActivity', () => {
    it('selects an issue comment when it is closest and preserves its reactions', () => {
      const mockPullRequest = mockPullRequestResponseNode({ state: 'OPEN' });
      mockPullRequest.comments.nodes = [
        {
          author: mockCommenter,
          updatedAt: '2026-01-01T17:00:01Z',
          url: 'https://github.com/example/repo/pull/123#issuecomment-1' as Link,
          reactions: { totalCount: 3 },
          reactionGroups: noReactionGroups,
        },
      ];
      mockPullRequest.reviews!.nodes = [
        {
          author: mockAuthor,
          state: 'COMMENTED',
          submittedAt: '2026-01-01T16:59:00Z',
          url: 'https://github.com/example/repo/pull/123#pullrequestreview-1' as Link,
        },
      ];

      const result = getClosestPullRequestActivity('2026-01-01T17:00:00Z', mockPullRequest);

      expect(result?.author).toBe(mockCommenter);
      expect(result?.comment?.reactions.totalCount).toBe(3);
    });

    it('handles timestamp lag by selecting the smallest absolute difference', () => {
      const mockPullRequest = mockPullRequestResponseNode({ state: 'OPEN' });
      mockPullRequest.reviews!.nodes = [
        {
          author: mockCommenter,
          state: 'COMMENTED',
          submittedAt: '2026-01-01T16:59:45Z',
          url: 'https://github.com/example/repo/pull/123#pullrequestreview-1' as Link,
        },
        {
          author: mockAuthor,
          state: 'APPROVED',
          submittedAt: '2026-01-01T16:59:58Z',
          url: 'https://github.com/example/repo/pull/123#pullrequestreview-2' as Link,
        },
      ];

      const result = getClosestPullRequestActivity('2026-01-01T17:00:03Z', mockPullRequest);

      expect(result?.author).toBe(mockAuthor);
    });

    it('ignores incomplete and invalid activity candidates', () => {
      const mockPullRequest = mockPullRequestResponseNode({ state: 'OPEN' });
      mockPullRequest.comments.nodes = [
        {
          author: null,
          updatedAt: '2026-01-01T17:00:00Z',
          url: 'https://github.com/example/repo/pull/123#issuecomment-1' as Link,
          reactions: { totalCount: 0 },
          reactionGroups: noReactionGroups,
        },
      ];
      mockPullRequest.reviews!.nodes = [
        {
          author: mockAuthor,
          state: 'COMMENTED',
          submittedAt: 'invalid timestamp',
          url: 'https://github.com/example/repo/pull/123#pullrequestreview-1' as Link,
        },
      ];

      expect(
        getClosestPullRequestActivity('2026-01-01T17:00:00Z', mockPullRequest),
      ).toBeUndefined();
    });

    it('deterministically prefers an issue comment on an exact tie', () => {
      const mockPullRequest = mockPullRequestResponseNode({ state: 'OPEN' });
      mockPullRequest.comments.nodes = [
        {
          author: mockCommenter,
          updatedAt: '2026-01-01T16:59:59Z',
          url: 'https://github.com/example/repo/pull/123#issuecomment-1' as Link,
          reactions: { totalCount: 0 },
          reactionGroups: noReactionGroups,
        },
      ];
      mockPullRequest.reviews!.nodes = [
        {
          author: mockAuthor,
          state: 'COMMENTED',
          submittedAt: '2026-01-01T17:00:01Z',
          url: 'https://github.com/example/repo/pull/123#pullrequestreview-1' as Link,
        },
      ];

      const result = getClosestPullRequestActivity('2026-01-01T17:00:00Z', mockPullRequest);

      expect(result?.author).toBe(mockCommenter);
    });

    it('returns no activity when the pull request has none', () => {
      const mockPullRequest = mockPullRequestResponseNode({ state: 'OPEN' });

      expect(
        getClosestPullRequestActivity('2026-01-01T17:00:00Z', mockPullRequest),
      ).toBeUndefined();
    });
  });

  describe('iconType', () => {
    const cases = {
      CLOSED: 'GitPullRequestClosedIcon',
      DRAFT: 'GitPullRequestDraftIcon',
      MERGE_QUEUE: 'GitMergeQueueIcon',
      MERGED: 'GitMergeIcon',
      OPEN: 'GitPullRequestIcon',
    } satisfies Record<GitifyPullRequestState, string>;

    it.each(Object.entries(cases) as Array<[GitifyPullRequestState, IconColor]>)(
      'iconType for pull request with state %s',
      (pullRequestState, pullRequestIconType) => {
        const mockNotification = mockPartialGitifyNotification({
          type: 'PullRequest',
          state: pullRequestState,
        });

        expect(pullRequestHandler.iconType(mockNotification).displayName).toBe(pullRequestIconType);
      },
    );
  });

  describe('iconColor', () => {
    const cases = {
      CLOSED: IconColor.RED,
      DRAFT: IconColor.GRAY,
      MERGE_QUEUE: IconColor.YELLOW,
      MERGED: IconColor.PURPLE,
      OPEN: IconColor.GREEN,
    } satisfies Record<GitifyPullRequestState, IconColor>;

    it.each(Object.entries(cases) as Array<[GitifyPullRequestState, IconColor]>)(
      'iconType for pull request with state %s',
      (pullRequestState, pullRequestIconColor) => {
        const mockNotification = mockPartialGitifyNotification({
          type: 'PullRequest',
          state: pullRequestState,
        });

        expect(pullRequestHandler.iconColor(mockNotification)).toBe(pullRequestIconColor);
      },
    );
  });

  it('defaultUrl', () => {
    const mockHtmlUrl = 'https://github.com/gitify-app/notifications-test' as Link;

    expect(
      pullRequestHandler.defaultUrl({
        repository: {
          htmlUrl: mockHtmlUrl,
        },
      } as GitifyNotification),
    ).toEqual(`${mockHtmlUrl}/pulls`);
  });

  describe('Pull Request Reviewers', () => {
    it('merges latest states and thread counts by reviewer', () => {
      const mockReviews = [
        {
          author: mockAuthorResponseNode('reviewer-1'),
          state: 'CHANGES_REQUESTED' as PullRequestReviewState,
        },
        {
          author: mockAuthorResponseNode('reviewer-2'),
          state: 'COMMENTED' as PullRequestReviewState,
        },
        {
          author: mockAuthorResponseNode('reviewer-1'),
          state: 'APPROVED' as PullRequestReviewState,
        },
        {
          author: mockAuthorResponseNode('reviewer-3'),
          state: 'APPROVED' as PullRequestReviewState,
        },
      ];

      const result = getPullRequestReviewers(mockGitHubCloudAccount, mockReviews, {
        nodes: [
          {
            isResolved: false,
            comments: { nodes: [{ author: { login: 'reviewer-1' } }] },
          },
          {
            isResolved: true,
            comments: { nodes: [{ author: { login: 'thread-only' } }] },
          },
          {
            isResolved: true,
            comments: { nodes: [{ author: null }] },
          },
        ],
      });

      expect(result).toEqual([
        { user: 'reviewer-1', state: 'APPROVED', threads: { resolved: 0, total: 1 } },
        { user: 'reviewer-2', state: 'COMMENTED', threads: { resolved: 0, total: 0 } },
        { user: 'reviewer-3', state: 'APPROVED', threads: { resolved: 0, total: 0 } },
        { user: 'thread-only', threads: { resolved: 1, total: 1 } },
        { user: 'Unknown reviewer', threads: { resolved: 1, total: 1 } },
      ]);
    });

    it('selects the latest reviewer state by submittedAt', () => {
      const result = getPullRequestReviewers(mockGitHubCloudAccount, [
        {
          author: mockAuthorResponseNode('reviewer-1'),
          state: 'APPROVED' as PullRequestReviewState,
          submittedAt: '2026-01-01T12:00:00Z',
        },
        {
          author: mockAuthorResponseNode('reviewer-1'),
          state: 'CHANGES_REQUESTED' as PullRequestReviewState,
          submittedAt: '2026-01-01T11:00:00Z',
        },
      ]);

      expect(result).toEqual([
        { user: 'reviewer-1', state: 'APPROVED', threads: { resolved: 0, total: 0 } },
      ]);
    });

    it('handles no reviews or threads', () => {
      const result = getPullRequestReviewers(mockGitHubCloudAccount, []);

      expect(result).toEqual([]);
    });

    it('aggregates thread resolution from the fetched thread page', () => {
      const result = getPullRequestReviewers(mockGitHubCloudAccount, [], {
        nodes: [
          {
            isResolved: false,
            comments: { nodes: [{ author: { login: 'zoe' } }] },
          },
          {
            isResolved: true,
            comments: { nodes: [{ author: { login: 'alice' } }] },
          },
          {
            isResolved: false,
            comments: { nodes: [{ author: { login: 'alice' } }] },
          },
          {
            isResolved: true,
            comments: { nodes: [{ author: null }] },
          },
        ],
      });

      expect(result).toEqual([
        { user: 'alice', threads: { resolved: 1, total: 2 } },
        { user: 'Unknown reviewer', threads: { resolved: 1, total: 1 } },
        { user: 'zoe', threads: { resolved: 0, total: 1 } },
      ]);
    });

    it('uses managed user names in review labels', () => {
      const account = {
        ...mockGitHubCloudAccount,
        user: { ...mockGitHubCloudAccount.user!, login: 'octocat_gitify' },
      };
      const result = getPullRequestReviewers(account, [
        {
          author: {
            login: 'notification-author_gitify',
            name: 'Notification Author',
            htmlUrl: mockAuthor.htmlUrl,
            avatarUrl: mockAuthor.avatarUrl,
            type: 'User',
          },
          state: 'APPROVED',
        },
      ]);

      expect(result).toEqual([
        {
          user: 'Notification Author (notification-author_gitify)',
          state: 'APPROVED',
          threads: { resolved: 0, total: 0 },
        },
      ]);
    });

    it('formats bot names used by review metric tooltips', () => {
      const result = getPullRequestReviewers(mockGitHubCloudAccount, [
        {
          author: {
            login: 'copilot-pull-request-reviewer',
            htmlUrl: 'https://github.com/apps/copilot-pull-request-reviewer' as Link,
            avatarUrl: 'https://avatars.githubusercontent.com/u/1' as Link,
            type: 'Bot' as const,
          },
          state: 'COMMENTED' as PullRequestReviewState,
        },
      ]);

      expect(result).toEqual([
        { user: 'copilot[ai]', state: 'COMMENTED', threads: { resolved: 0, total: 0 } },
      ]);
    });
  });

  describe('Pull Request Review Requests - getReviewRequestTypes', () => {
    it('returns direct when user is directly requested', () => {
      const nodes = [
        {
          requestedReviewer: {
            __typename: 'User' as const,
            login: 'current-user',
          },
        },
      ];

      const result = getReviewRequestTypes(nodes, 'current-user');

      expect(result).toEqual(['direct']);
    });

    it('returns team when a team is requested', () => {
      const nodes = [
        {
          requestedReviewer: {
            __typename: 'Team' as const,
          },
        },
      ];

      const result = getReviewRequestTypes(nodes, 'current-user');

      expect(result).toEqual(['team']);
    });

    it('returns both when user is directly requested and team is requested', () => {
      const nodes = [
        {
          requestedReviewer: {
            __typename: 'User' as const,
            login: 'current-user',
          },
        },
        {
          requestedReviewer: {
            __typename: 'Team' as const,
          },
        },
      ];

      const result = getReviewRequestTypes(nodes, 'current-user');

      expect(result).toContain('direct');
      expect(result).toContain('team');
    });

    it('does not include direct for other users', () => {
      const nodes = [
        {
          requestedReviewer: {
            __typename: 'User' as const,
            login: 'other-user',
          },
        },
      ];

      const result = getReviewRequestTypes(nodes, 'current-user');

      expect(result).not.toContain('direct');
    });

    it('returns empty array when no nodes', () => {
      const result = getReviewRequestTypes([], 'current-user');
      expect(result).toEqual([]);
    });

    it('returns empty array when no current user login', () => {
      const nodes = [
        {
          requestedReviewer: {
            __typename: 'User' as const,
            login: 'current-user',
          },
        },
      ];

      const result = getReviewRequestTypes(nodes, undefined);
      expect(result).toEqual([]);
    });
  });
});
