import axios from 'axios';
import nock from 'nock';

import {
  createMockSubject,
  createPartialMockNotification,
} from '../../../__mocks__/notifications-mocks';
import { mockSettings } from '../../../__mocks__/state-mocks';
import { createPartialMockUser } from '../../../__mocks__/user-mocks';
import { type GitifySubject, IconColor, type Link } from '../../../types';
import type { Notification } from '../../../typesGitHub';
import type {
  FetchPullRequestByNumberQuery,
  PullRequestReviewState,
} from '../../api/graphql/generated/graphql';
import { getLatestReviewForReviewers, pullRequestHandler } from './pullRequest';

type PullRequestResponse =
  FetchPullRequestByNumberQuery['repository']['pullRequest'];

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
                url: 'https://github.com/gitify-app/notifications-test/pulls/123',
                author: mockAuthor,
                labels: null,
                comments: {
                  totalCount: 0,
                  nodes: [],
                },
                reviews: {
                  totalCount: 0,
                  nodes: [],
                },
                milestone: null,
                closingIssuesReferences: {
                  nodes: [],
                },
              } as PullRequestResponse,
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
        reviews: null,
        labels: [],
        linkedIssues: [],
        comments: 0,
        milestone: null,
        htmlUrl: 'https://github.com/gitify-app/notifications-test/pulls/123',
      } as GitifySubject);
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
                url: 'https://github.com/gitify-app/notifications-test/pulls/123',
                author: mockAuthor,
                labels: null,
                comments: {
                  totalCount: 0,
                  nodes: [],
                },
                reviews: {
                  totalCount: 0,
                  nodes: [],
                },
                milestone: null,
                closingIssuesReferences: {
                  nodes: [],
                },
              } as PullRequestResponse,
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
        reviews: null,
        labels: [],
        linkedIssues: [],
        comments: 0,
        milestone: null,
        htmlUrl: 'https://github.com/gitify-app/notifications-test/pulls/123',
      } as GitifySubject);
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
                url: 'https://github.com/gitify-app/notifications-test/pulls/123',
                author: mockAuthor,
                labels: null,
                comments: {
                  totalCount: 0,
                  nodes: [],
                },
                reviews: {
                  totalCount: 0,
                  nodes: [],
                },
                milestone: null,
                closingIssuesReferences: {
                  nodes: [],
                },
              } as PullRequestResponse,
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
        reviews: null,
        labels: [],
        linkedIssues: [],
        comments: 0,
        milestone: null,
        htmlUrl: 'https://github.com/gitify-app/notifications-test/pulls/123',
      } as GitifySubject);
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
                url: 'https://github.com/gitify-app/notifications-test/pulls/123',
                author: mockAuthor,
                labels: null,
                comments: {
                  totalCount: 0,
                  nodes: [],
                },
                reviews: {
                  totalCount: 0,
                  nodes: [],
                },
                milestone: null,
                closingIssuesReferences: {
                  nodes: [],
                },
              } as PullRequestResponse,
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
        reviews: null,
        labels: [],
        linkedIssues: [],
        comments: 0,
        milestone: null,
        htmlUrl: 'https://github.com/gitify-app/notifications-test/pulls/123',
      } as GitifySubject);
    });

    it('with comments', async () => {
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
                url: 'https://github.com/gitify-app/notifications-test/pulls/123',
                author: mockAuthor,
                labels: {
                  nodes: [{ name: 'enhancement' }],
                },
                comments: {
                  totalCount: 1,
                  nodes: [
                    {
                      author: mockCommenter,
                      url: 'https://github.com/gitify-app/notifications-test/pulls/123#issuecomment-1234',
                    },
                  ],
                },
                reviews: {
                  totalCount: 0,
                  nodes: [],
                },
                milestone: null,
                closingIssuesReferences: {
                  nodes: [],
                },
              } as PullRequestResponse,
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
          'https://github.com/gitify-app/notifications-test/pulls/123#issuecomment-1234',
      } as GitifySubject);
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
                url: 'https://github.com/gitify-app/notifications-test/pulls/123',
                author: mockAuthor,
                labels: {
                  nodes: [{ name: 'enhancement' }],
                },
                comments: {
                  totalCount: 0,
                  nodes: [],
                },
                reviews: {
                  totalCount: 0,
                  nodes: [],
                },
                milestone: null,
                closingIssuesReferences: {
                  nodes: [],
                },
              } as PullRequestResponse,
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
        reviews: null,
        labels: ['enhancement'],
        linkedIssues: [],
        comments: 0,
        milestone: null,
        htmlUrl: 'https://github.com/gitify-app/notifications-test/pulls/123',
      } as GitifySubject);
    });

    it('with linked issues', async () => {
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
                url: 'https://github.com/gitify-app/notifications-test/pulls/123',
                author: mockAuthor,
                labels: null,
                comments: {
                  totalCount: 0,
                  nodes: [],
                },
                reviews: {
                  totalCount: 0,
                  nodes: [],
                },
                milestone: null,
                closingIssuesReferences: {
                  nodes: [
                    {
                      number: 789,
                    },
                  ],
                },
              } as PullRequestResponse,
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
        reviews: null,
        labels: [],
        linkedIssues: ['#789'],
        comments: 0,
        milestone: null,
        htmlUrl: 'https://github.com/gitify-app/notifications-test/pulls/123',
      } as GitifySubject);
    });

    it('with milestone', async () => {
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
                url: 'https://github.com/gitify-app/notifications-test/pulls/123',
                author: mockAuthor,
                labels: {
                  nodes: [],
                },
                comments: {
                  totalCount: 0,
                  nodes: [],
                },
                reviews: {
                  totalCount: 0,
                  nodes: [],
                },
                milestone: {
                  state: 'OPEN',
                  title: 'Open Milestone',
                },
                closingIssuesReferences: {
                  nodes: [],
                },
              } as PullRequestResponse,
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
        reviews: null,
        labels: [],
        linkedIssues: [],
        comments: 0,
        milestone: {
          state: 'OPEN',
          title: 'Open Milestone',
        },
        htmlUrl: 'https://github.com/gitify-app/notifications-test/pulls/123',
      } as GitifySubject);
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

  it('iconColor', () => {
    expect(
      pullRequestHandler.iconColor(
        createMockSubject({ type: 'PullRequest', state: 'OPEN' }),
      ),
    ).toBe(IconColor.GREEN);

    expect(
      pullRequestHandler.iconColor(
        createMockSubject({ type: 'PullRequest', state: 'CLOSED' }),
      ),
    ).toBe(IconColor.RED);

    expect(
      pullRequestHandler.iconColor(
        createMockSubject({ type: 'PullRequest', state: 'MERGED' }),
      ),
    ).toBe(IconColor.PURPLE);

    expect(
      pullRequestHandler.iconColor(
        createMockSubject({ type: 'PullRequest', state: 'DRAFT' }),
      ),
    ).toBe(IconColor.GRAY);
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
