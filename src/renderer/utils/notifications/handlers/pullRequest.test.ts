import { mockPartialGitifyNotification } from '../../../__mocks__/notifications-mocks';
import { mockSettings } from '../../../__mocks__/state-mocks';
import {
  mockAuthor,
  mockCommenter,
  mockPullRequestResponseNode,
} from '../../api/__mocks__/response-mocks';

import type { GitifyNotification } from '../../../types';
import {
  type GitifyPullRequestState,
  type GitifySubject,
  IconColor,
  type Link,
} from '../../../types';

import * as apiClient from '../../api/client';
import type {
  FetchPullRequestByNumberQuery,
  PullRequestReviewState,
} from '../../api/graphql/generated/graphql';
import { getLatestReviewForReviewers, pullRequestHandler } from './pullRequest';

describe('renderer/utils/notifications/handlers/pullRequest.ts', () => {
  describe('mergeQueryConfig', () => {
    describe('supportsMergedQueryEnrichment', () => {
      it('should support merge query', () => {
        expect(pullRequestHandler.supportsMergedQueryEnrichment).toBeTruthy();
      });
    });
  });

  describe('enrich', () => {
    const fetchPullByNumberSpy = jest.spyOn(apiClient, 'fetchPullByNumber');

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

      const result = await pullRequestHandler.enrich(
        mockNotification,
        mockSettings,
      );

      expect(result).toEqual({
        number: 123,
        state: 'CLOSED',
        user: {
          login: mockAuthor.login,
          avatarUrl: mockAuthor.avatarUrl,
          htmlUrl: mockAuthor.htmlUrl,
          type: mockAuthor.type,
        },
        reviews: null,
        labels: [],
        linkedIssues: [],
        commentCount: 0,
        milestone: null,
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/pulls/123' as Link,
      } satisfies Partial<GitifySubject>);
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

      const result = await pullRequestHandler.enrich(
        mockNotification,
        mockSettings,
      );

      expect(result).toEqual({
        number: 123,
        state: 'DRAFT',
        user: {
          login: mockAuthor.login,
          avatarUrl: mockAuthor.avatarUrl,
          htmlUrl: mockAuthor.htmlUrl,
          type: mockAuthor.type,
        },
        reviews: null,
        labels: [],
        linkedIssues: [],
        commentCount: 0,
        milestone: null,
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/pulls/123' as Link,
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

      const result = await pullRequestHandler.enrich(
        mockNotification,
        mockSettings,
      );

      expect(result).toEqual({
        number: 123,
        state: 'MERGE_QUEUE',
        user: {
          login: mockAuthor.login,
          avatarUrl: mockAuthor.avatarUrl,
          htmlUrl: mockAuthor.htmlUrl,
          type: mockAuthor.type,
        },
        reviews: null,
        labels: [],
        linkedIssues: [],
        commentCount: 0,
        milestone: null,
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/pulls/123' as Link,
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

      const result = await pullRequestHandler.enrich(
        mockNotification,
        mockSettings,
      );

      expect(result).toEqual({
        number: 123,
        state: 'MERGED',
        user: {
          login: mockAuthor.login,
          avatarUrl: mockAuthor.avatarUrl,
          htmlUrl: mockAuthor.htmlUrl,
          type: mockAuthor.type,
        },
        reviews: null,
        labels: [],
        linkedIssues: [],
        commentCount: 0,
        milestone: null,
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/pulls/123' as Link,
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
            url: 'https://github.com/gitify-app/notifications-test/pulls/123#issuecomment-1234',
          },
        ],
      };

      fetchPullByNumberSpy.mockResolvedValue({
        repository: {
          pullRequest: mockPullRequest,
        },
      } satisfies FetchPullRequestByNumberQuery);

      const result = await pullRequestHandler.enrich(
        mockNotification,
        mockSettings,
      );

      expect(result).toEqual({
        number: 123,
        state: 'OPEN',
        user: {
          login: mockCommenter.login,
          avatarUrl: mockCommenter.avatarUrl,
          htmlUrl: mockCommenter.htmlUrl,
          type: mockCommenter.type,
        },
        reviews: null,
        labels: [],
        linkedIssues: [],
        commentCount: 1,
        milestone: null,
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/pulls/123#issuecomment-1234' as Link,
      } satisfies Partial<GitifySubject>);
    });

    it('with labels', async () => {
      const mockPullRequest = mockPullRequestResponseNode({
        state: 'OPEN',
      });
      mockPullRequest.labels = {
        nodes: [
          {
            name: 'enhancement',
          },
        ],
      };

      fetchPullByNumberSpy.mockResolvedValue({
        repository: {
          pullRequest: mockPullRequest,
        },
      } satisfies FetchPullRequestByNumberQuery);

      const result = await pullRequestHandler.enrich(
        mockNotification,
        mockSettings,
      );

      expect(result).toEqual({
        number: 123,
        state: 'OPEN',
        user: {
          login: mockAuthor.login,
          avatarUrl: mockAuthor.avatarUrl,
          htmlUrl: mockAuthor.htmlUrl,
          type: mockAuthor.type,
        },
        reviews: null,
        labels: ['enhancement'],
        linkedIssues: [],
        commentCount: 0,
        milestone: null,
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/pulls/123' as Link,
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

      const result = await pullRequestHandler.enrich(
        mockNotification,
        mockSettings,
      );

      expect(result).toEqual({
        number: 123,
        state: 'OPEN',
        user: {
          login: mockAuthor.login,
          avatarUrl: mockAuthor.avatarUrl,
          htmlUrl: mockAuthor.htmlUrl,
          type: mockAuthor.type,
        },
        reviews: null,
        labels: [],
        linkedIssues: ['#789'],
        commentCount: 0,
        milestone: null,
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/pulls/123' as Link,
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

      const result = await pullRequestHandler.enrich(
        mockNotification,
        mockSettings,
      );

      expect(result).toEqual({
        number: 123,
        state: 'OPEN',
        user: {
          login: mockAuthor.login,
          avatarUrl: mockAuthor.avatarUrl,
          htmlUrl: mockAuthor.htmlUrl,
          type: mockAuthor.type,
        },
        reviews: null,
        labels: [],
        linkedIssues: [],
        commentCount: 0,
        milestone: {
          state: 'OPEN',
          title: 'Open Milestone',
        },
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/pulls/123' as Link,
      } satisfies Partial<GitifySubject>);
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

    it.each(
      Object.entries(cases) as Array<[GitifyPullRequestState, IconColor]>,
    )('iconType for pull request with state %s', (pullRequestState, pullRequestIconType) => {
      const mockNotification = mockPartialGitifyNotification({
        type: 'PullRequest',
        state: pullRequestState,
      });

      expect(pullRequestHandler.iconType(mockNotification).displayName).toBe(
        pullRequestIconType,
      );
    });
  });

  describe('iconColor', () => {
    const cases = {
      CLOSED: IconColor.RED,
      DRAFT: IconColor.GRAY,
      MERGE_QUEUE: IconColor.YELLOW,
      MERGED: IconColor.PURPLE,
      OPEN: IconColor.GREEN,
    } satisfies Record<GitifyPullRequestState, IconColor>;

    it.each(
      Object.entries(cases) as Array<[GitifyPullRequestState, IconColor]>,
    )('iconType for pull request with state %s', (pullRequestState, pullRequestIconColor) => {
      const mockNotification = mockPartialGitifyNotification({
        type: 'PullRequest',
        state: pullRequestState,
      });

      expect(pullRequestHandler.iconColor(mockNotification)).toBe(
        pullRequestIconColor,
      );
    });
  });

  it('defaultUrl', () => {
    const mockHtmlUrl =
      'https://github.com/gitify-app/notifications-test' as Link;

    expect(
      pullRequestHandler.defaultUrl({
        repository: {
          htmlUrl: mockHtmlUrl,
        },
      } as GitifyNotification),
    ).toEqual(`${mockHtmlUrl}/pulls`);
  });

  describe('Pull Request Reviews - Latest Reviews By Reviewer', () => {
    it('returns latest review state per reviewer', async () => {
      const mockReviews = [
        {
          author: {
            login: 'reviewer-1',
          },
          state: 'CHANGES_REQUESTED' as PullRequestReviewState,
        },
        {
          author: {
            login: 'reviewer-2',
          },
          state: 'COMMENTED' as PullRequestReviewState,
        },
        {
          author: {
            login: 'reviewer-1',
          },
          state: 'APPROVED' as PullRequestReviewState,
        },
        {
          author: {
            login: 'reviewer-3',
          },
          state: 'APPROVED' as PullRequestReviewState,
        },
      ];

      const result = getLatestReviewForReviewers(mockReviews);

      expect(result).toEqual([
        { state: 'APPROVED', users: ['reviewer-3', 'reviewer-1'] },
        { state: 'COMMENTED', users: ['reviewer-2'] },
      ]);
    });

    it('handles no PR reviews yet', async () => {
      const result = getLatestReviewForReviewers([]);

      expect(result).toBeNull();
    });
  });
});
