import axios from 'axios';
import nock from 'nock';

import {
  createMockSubject,
  createPartialMockNotification,
} from '../../../__mocks__/notifications-mocks';
import { mockSettings } from '../../../__mocks__/state-mocks';
import { createPartialMockUser } from '../../../__mocks__/user-mocks';
import {
  type GitifyPullRequestState,
  type GitifySubject,
  IconColor,
  type Link,
} from '../../../types';
import type { Notification } from '../../../typesGitHub';
import type {
  PullRequestDetailsFragment,
  PullRequestReviewState,
  PullRequestState,
} from '../../api/graphql/generated/graphql';
import { getLatestReviewForReviewers, pullRequestHandler } from './pullRequest';

const mockAuthor = createPartialMockUser('some-author');
const mockCommenter = createPartialMockUser('some-commenter');

describe('renderer/utils/notifications/handlers/pullRequest.ts', () => {
  let mockNotification: Notification;

  beforeEach(() => {
    mockNotification = createPartialMockNotification({
      title: 'This is a mock pull request',
      type: 'PullRequest',
      url: 'https://api.github.com/repos/gitify-app/notifications-test/pulls/1' as Link,
      latest_comment_url:
        'https://api.github.com/repos/gitify-app/notifications-test/issues/comments/302888448' as Link,
    });
  });

  describe('enrich', () => {
    beforeEach(() => {
      // axios will default to using the XHR adapter which can't be intercepted
      // by nock. So, configure axios to use the node adapter.
      axios.defaults.adapter = 'http';
    });

    it('pull request with state', async () => {
      const mockPullRequest = mockPullRequestResponseNode({ state: 'CLOSED' });

      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            repository: {
              pullRequest: mockPullRequest,
            },
          },
        });

      const result = await pullRequestHandler.enrich(
        mockNotification,
        mockSettings,
      );

      expect(result).toEqual({
        number: 123,
        state: 'CLOSED',
        user: {
          login: mockAuthor.login,
          html_url: mockAuthor.html_url,
          avatar_url: mockAuthor.avatar_url,
          type: mockAuthor.type,
        },
        reviews: undefined,
        labels: [],
        linkedIssues: [],
        comments: 0,
        milestone: undefined,
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/pulls/123' as Link,
      } as unknown as GitifySubject);
    });

    it('draft pull request state', async () => {
      const mockPullRequest = mockPullRequestResponseNode({
        state: 'OPEN',
        isDraft: true,
      });

      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            repository: {
              pullRequest: mockPullRequest,
            },
          },
        });

      const result = await pullRequestHandler.enrich(
        mockNotification,
        mockSettings,
      );

      expect(result).toEqual({
        number: 123,
        state: 'DRAFT',
        user: {
          login: mockAuthor.login,
          html_url: mockAuthor.html_url,
          avatar_url: mockAuthor.avatar_url,
          type: mockAuthor.type,
        },
        reviews: undefined,
        labels: [],
        linkedIssues: [],
        comments: 0,
        milestone: undefined,
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/pulls/123' as Link,
      } as unknown as GitifySubject);
    });

    it('merge queue pull request state', async () => {
      const mockPullRequest = mockPullRequestResponseNode({
        state: 'OPEN',
        isInMergeQueue: true,
      });

      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            repository: {
              pullRequest: mockPullRequest,
            },
          },
        });

      const result = await pullRequestHandler.enrich(
        mockNotification,
        mockSettings,
      );

      expect(result).toEqual({
        number: 123,
        state: 'MERGE_QUEUE',
        user: {
          login: mockAuthor.login,
          html_url: mockAuthor.html_url,
          avatar_url: mockAuthor.avatar_url,
          type: mockAuthor.type,
        },
        reviews: undefined,
        labels: [],
        linkedIssues: [],
        comments: 0,
        milestone: undefined,
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/pulls/123' as Link,
      } as unknown as GitifySubject);
    });

    it('merged pull request state', async () => {
      const mockPullRequest = mockPullRequestResponseNode({
        state: 'MERGED',
        merged: true,
      });

      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            repository: {
              pullRequest: mockPullRequest,
            },
          },
        });

      const result = await pullRequestHandler.enrich(
        mockNotification,
        mockSettings,
      );

      expect(result).toEqual({
        number: 123,
        state: 'MERGED',
        user: {
          login: mockAuthor.login,
          html_url: mockAuthor.html_url,
          avatar_url: mockAuthor.avatar_url,
          type: mockAuthor.type,
        },
        reviews: undefined,
        labels: [],
        linkedIssues: [],
        comments: 0,
        milestone: undefined,
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/pulls/123' as Link,
      } as unknown as GitifySubject);
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

      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            repository: {
              pullRequest: mockPullRequest,
            },
          },
        });

      const result = await pullRequestHandler.enrich(
        mockNotification,
        mockSettings,
      );

      expect(result).toEqual({
        number: 123,
        state: 'OPEN',
        user: {
          login: mockCommenter.login,
          html_url: mockCommenter.html_url,
          avatar_url: mockCommenter.avatar_url,
          type: mockCommenter.type,
        },
        reviews: undefined,
        labels: [],
        linkedIssues: [],
        comments: 1,
        milestone: undefined,
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/pulls/123#issuecomment-1234',
      } as unknown as GitifySubject);
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

      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            repository: {
              pullRequest: mockPullRequest,
            },
          },
        });

      const result = await pullRequestHandler.enrich(
        mockNotification,
        mockSettings,
      );

      expect(result).toEqual({
        number: 123,
        state: 'OPEN',
        user: {
          login: mockAuthor.login,
          html_url: mockAuthor.html_url,
          avatar_url: mockAuthor.avatar_url,
          type: mockAuthor.type,
        },
        reviews: undefined,
        labels: ['enhancement'],
        linkedIssues: [],
        comments: 0,
        milestone: undefined,
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/pulls/123' as Link,
      } as unknown as GitifySubject);
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

      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            repository: {
              pullRequest: mockPullRequest,
            },
          },
        });

      const result = await pullRequestHandler.enrich(
        mockNotification,
        mockSettings,
      );

      expect(result).toEqual({
        number: 123,
        state: 'OPEN',
        user: {
          login: mockAuthor.login,
          html_url: mockAuthor.html_url,
          avatar_url: mockAuthor.avatar_url,
          type: mockAuthor.type,
        },
        reviews: undefined,
        labels: [],
        linkedIssues: ['#789'],
        comments: 0,
        milestone: undefined,
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/pulls/123' as Link,
      } as unknown as GitifySubject);
    });

    it('with milestone', async () => {
      const mockPullRequest = mockPullRequestResponseNode({
        state: 'OPEN',
      });
      mockPullRequest.milestone = {
        state: 'OPEN',
        title: 'Open Milestone',
      };

      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            repository: {
              pullRequest: mockPullRequest,
            },
          },
        });

      const result = await pullRequestHandler.enrich(
        mockNotification,
        mockSettings,
      );

      expect(result).toEqual({
        number: 123,
        state: 'OPEN',
        user: {
          login: mockAuthor.login,
          html_url: mockAuthor.html_url,
          avatar_url: mockAuthor.avatar_url,
          type: mockAuthor.type,
        },
        reviews: undefined,
        labels: [],
        linkedIssues: [],
        comments: 0,
        milestone: {
          state: 'OPEN',
          title: 'Open Milestone',
        },
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/pulls/123' as Link,
      } as unknown as GitifySubject);
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
      expect(
        pullRequestHandler.iconType(
          createMockSubject({ type: 'PullRequest', state: pullRequestState }),
        )!.displayName,
      ).toBe(pullRequestIconType);
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
      expect(
        pullRequestHandler.iconColor(
          createMockSubject({ type: 'PullRequest', state: pullRequestState }),
        ),
      ).toBe(pullRequestIconColor);
    });
  });

  it('defaultUrl', () => {
    const mockHtmlUrl =
      'https://github.com/gitify-app/notifications-test' as Link;

    expect(
      pullRequestHandler.defaultUrl({
        repository: {
          html_url: mockHtmlUrl,
        },
      } as Notification),
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

function mockPullRequestResponseNode(mocks: {
  state: PullRequestState;
  isDraft?: boolean;
  merged?: boolean;
  isInMergeQueue?: boolean;
}): PullRequestDetailsFragment {
  return {
    __typename: 'PullRequest',
    number: 123,
    title: 'Test PR',
    state: mocks.state,
    isDraft: mocks.isDraft ?? false,
    merged: mocks.merged ?? false,
    isInMergeQueue: mocks.isInMergeQueue ?? false,
    url: 'https://github.com/gitify-app/notifications-test/pulls/123',
    author: mockAuthor,
    labels: { nodes: [] },
    comments: {
      totalCount: 0,
      nodes: [],
    },
    reviews: {
      totalCount: 0,
      nodes: [],
    },
    milestone: undefined,
    closingIssuesReferences: {
      nodes: [],
    },
  };
}
