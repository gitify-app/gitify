import axios from 'axios';
import nock from 'nock';

import {
  createMockSubject,
  createPartialMockNotification,
} from '../../../__mocks__/notifications-mocks';
import { mockSettings } from '../../../__mocks__/state-mocks';
import { createPartialMockUser } from '../../../__mocks__/user-mocks';
import type { Link } from '../../../types';
import type { Notification } from '../../../typesGitHub';
import type {
  FetchPullByNumberQuery,
  PullRequestReviewState,
} from '../../api/graphql/generated/graphql';
import { getLatestReviewForReviewers, pullRequestHandler } from './pullRequest';

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
    const mockAuthor = createPartialMockUser('some-author');
    const mockCommenter = createPartialMockUser('some-commenter');

    beforeEach(() => {
      // axios will default to using the XHR adapter which can't be intercepted
      // by nock. So, configure axios to use the node adapter.
      axios.defaults.adapter = 'http';
    });

    it('closed pull request state', async () => {
      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            repository: {
              pullRequest: {
                __typename: 'PullRequest',
                number: 123,
                title: 'Test PR',
                state: 'CLOSED',
                isDraft: false,
                merged: false,
                isInMergeQueue: false,
                url: 'https://github.com/gitify-app/noticiation-test/pulls/1',
                user: mockAuthor,
                labels: null,
                comments: {
                  totalCount: 1,
                  nodes: [
                    {
                      author: mockCommenter,
                      url: 'https://github.com/gitify-app/noticiation-test/pulls/1#issuecomment-1234',
                    },
                  ],
                },
                reviews: null,
              } as FetchPullByNumberQuery['repository']['pullRequest'],
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
          login: mockCommenter.login,
          html_url: mockCommenter.html_url,
          avatar_url: mockCommenter.avatar_url,
          type: mockCommenter.type,
        },
        reviews: null,
        labels: [],
        linkedIssues: [],
        comments: 1,
        milestone: null,
        htmlUrl:
          'https://github.com/gitify-app/noticiation-test/pulls/1#issuecomment-1234',
      });
    });

    it('draft pull request state', async () => {
      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            repository: {
              pullRequest: {
                __typename: 'PullRequest',
                number: 123,
                title: 'Test PR',
                state: 'OPEN',
                isDraft: true,
                merged: false,
                isInMergeQueue: false,
                url: 'https://github.com/gitify-app/noticiation-test/pulls/1',
                user: mockAuthor,
                labels: null,
                comments: {
                  totalCount: 1,
                  nodes: [
                    {
                      author: mockCommenter,
                      url: 'https://github.com/gitify-app/noticiation-test/pulls/1#issuecomment-1234',
                    },
                  ],
                },
                reviews: null,
              } as FetchPullByNumberQuery['repository']['pullRequest'],
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
          login: mockCommenter.login,
          html_url: mockCommenter.html_url,
          avatar_url: mockCommenter.avatar_url,
          type: mockCommenter.type,
        },
        reviews: null,
        labels: [],
        linkedIssues: [],
        comments: 1,
        milestone: null,
        htmlUrl:
          'https://github.com/gitify-app/noticiation-test/pulls/1#issuecomment-1234',
      });
    });

    it('merged pull request state', async () => {
      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            repository: {
              pullRequest: {
                __typename: 'PullRequest',
                number: 123,
                title: 'Test PR',
                state: 'MERGED',
                isDraft: false,
                merged: true,
                isInMergeQueue: false,
                url: 'https://github.com/gitify-app/noticiation-test/pulls/1',
                user: mockAuthor,
                labels: null,
                comments: {
                  totalCount: 1,
                  nodes: [
                    {
                      author: mockCommenter,
                      url: 'https://github.com/gitify-app/noticiation-test/pulls/1#issuecomment-1234',
                    },
                  ],
                },
                reviews: null,
              } as FetchPullByNumberQuery['repository']['pullRequest'],
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
          login: mockCommenter.login,
          html_url: mockCommenter.html_url,
          avatar_url: mockCommenter.avatar_url,
          type: mockCommenter.type,
        },
        reviews: null,
        labels: [],
        linkedIssues: [],
        comments: 1,
        milestone: null,
        htmlUrl:
          'https://github.com/gitify-app/noticiation-test/pulls/1#issuecomment-1234',
      });
    });

    it('open pull request state', async () => {
      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            repository: {
              pullRequest: {
                __typename: 'PullRequest',
                number: 123,
                title: 'Test PR',
                state: 'OPEN',
                isDraft: false,
                merged: false,
                isInMergeQueue: false,
                url: 'https://github.com/gitify-app/noticiation-test/pulls/1',
                user: mockAuthor,
                labels: null,
                comments: {
                  totalCount: 1,
                  nodes: [
                    {
                      author: mockCommenter,
                      url: 'https://github.com/gitify-app/noticiation-test/pulls/1#issuecomment-1234',
                    },
                  ],
                },
                reviews: null,
              } as FetchPullByNumberQuery['repository']['pullRequest'],
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
        reviews: null,
        labels: [],
        linkedIssues: [],
        comments: 1,
        milestone: null,
        htmlUrl:
          'https://github.com/gitify-app/noticiation-test/pulls/1#issuecomment-1234',
      });
    });

    it('with labels', async () => {
      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            repository: {
              pullRequest: {
                __typename: 'PullRequest',
                number: 123,
                title: 'Test PR',
                state: 'OPEN',
                isDraft: false,
                merged: false,
                isInMergeQueue: false,
                url: 'https://github.com/gitify-app/noticiation-test/pulls/1',
                user: mockAuthor,
                labels: {
                  nodes: [{ name: 'enhancement' }],
                },
                comments: {
                  totalCount: 1,
                  nodes: [
                    {
                      author: mockCommenter,
                      url: 'https://github.com/gitify-app/noticiation-test/pulls/1#issuecomment-1234',
                    },
                  ],
                },
                reviews: null,
              } as FetchPullByNumberQuery['repository']['pullRequest'],
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
        reviews: null,
        labels: ['enhancement'],
        linkedIssues: [],
        comments: 1,
        milestone: null,
        htmlUrl:
          'https://github.com/gitify-app/noticiation-test/pulls/1#issuecomment-1234',
      });
    });
  });

  it('iconType', () => {
    expect(
      pullRequestHandler.iconType(createMockSubject({ type: 'PullRequest' }))
        .displayName,
    ).toBe('GitPullRequestIcon');

    expect(
      pullRequestHandler.iconType(
        createMockSubject({
          type: 'PullRequest',
          state: 'DRAFT',
        }),
      ).displayName,
    ).toBe('GitPullRequestDraftIcon');

    expect(
      pullRequestHandler.iconType(
        createMockSubject({
          type: 'PullRequest',
          state: 'CLOSED',
        }),
      ).displayName,
    ).toBe('GitPullRequestClosedIcon');

    expect(
      pullRequestHandler.iconType(
        createMockSubject({
          type: 'PullRequest',
          state: 'MERGED',
        }),
      ).displayName,
    ).toBe('GitMergeIcon');
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
