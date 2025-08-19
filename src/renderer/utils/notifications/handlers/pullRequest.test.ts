import axios from 'axios';
import nock from 'nock';

import { createSubjectMock } from '../../../__mocks__/notifications-mocks';
import {
  partialMockNotification,
  partialMockUser,
} from '../../../__mocks__/partial-mocks';
import { mockSettings } from '../../../__mocks__/state-mocks';
import type { Link } from '../../../types';
import type { Notification, PullRequest } from '../../../typesGitHub';
import {
  getLatestReviewForReviewers,
  parseLinkedIssuesFromPr,
  pullRequestHandler,
} from './pullRequest';

describe('renderer/utils/notifications/handlers/pullRequest.ts', () => {
  let mockNotification: Notification;

  beforeEach(() => {
    mockNotification = partialMockNotification({
      title: 'This is a mock pull request',
      type: 'PullRequest',
      url: 'https://api.github.com/repos/gitify-app/notifications-test/pulls/1' as Link,
      latest_comment_url:
        'https://api.github.com/repos/gitify-app/notifications-test/issues/comments/302888448' as Link,
    });
  });

  describe('enrich', () => {
    const mockAuthor = partialMockUser('some-author');
    const mockCommenter = partialMockUser('some-commenter');

    beforeEach(() => {
      // axios will default to using the XHR adapter which can't be intercepted
      // by nock. So, configure axios to use the node adapter.
      axios.defaults.adapter = 'http';
    });

    it('closed pull request state', async () => {
      nock('https://api.github.com')
        .get('/repos/gitify-app/notifications-test/pulls/1')
        .reply(200, {
          number: 123,
          state: 'closed',
          draft: false,
          merged: false,
          user: mockAuthor,
          labels: [],
        });

      nock('https://api.github.com')
        .get('/repos/gitify-app/notifications-test/issues/comments/302888448')
        .reply(200, { user: mockCommenter });

      nock('https://api.github.com')
        .get('/repos/gitify-app/notifications-test/pulls/1/reviews')
        .reply(200, []);

      const result = await pullRequestHandler.enrich(
        mockNotification,
        mockSettings,
      );

      expect(result).toEqual({
        number: 123,
        state: 'closed',
        user: {
          login: mockCommenter.login,
          html_url: mockCommenter.html_url,
          avatar_url: mockCommenter.avatar_url,
          type: mockCommenter.type,
        },
        reviews: null,
        labels: [],
        linkedIssues: [],
      });
    });

    it('draft pull request state', async () => {
      nock('https://api.github.com')
        .get('/repos/gitify-app/notifications-test/pulls/1')
        .reply(200, {
          number: 123,
          state: 'open',
          draft: true,
          merged: false,
          user: mockAuthor,
          labels: [],
        });

      nock('https://api.github.com')
        .get('/repos/gitify-app/notifications-test/issues/comments/302888448')
        .reply(200, { user: mockCommenter });

      nock('https://api.github.com')
        .get('/repos/gitify-app/notifications-test/pulls/1/reviews')
        .reply(200, []);

      const result = await pullRequestHandler.enrich(
        mockNotification,
        mockSettings,
      );

      expect(result).toEqual({
        number: 123,
        state: 'draft',
        user: {
          login: mockCommenter.login,
          html_url: mockCommenter.html_url,
          avatar_url: mockCommenter.avatar_url,
          type: mockCommenter.type,
        },
        reviews: null,
        labels: [],
        linkedIssues: [],
      });
    });

    it('merged pull request state', async () => {
      nock('https://api.github.com')
        .get('/repos/gitify-app/notifications-test/pulls/1')
        .reply(200, {
          number: 123,
          state: 'open',
          draft: false,
          merged: true,
          user: mockAuthor,
          labels: [],
        });

      nock('https://api.github.com')
        .get('/repos/gitify-app/notifications-test/issues/comments/302888448')
        .reply(200, { user: mockCommenter });

      nock('https://api.github.com')
        .get('/repos/gitify-app/notifications-test/pulls/1/reviews')
        .reply(200, []);

      const result = await pullRequestHandler.enrich(
        mockNotification,
        mockSettings,
      );

      expect(result).toEqual({
        number: 123,
        state: 'merged',
        user: {
          login: mockCommenter.login,
          html_url: mockCommenter.html_url,
          avatar_url: mockCommenter.avatar_url,
          type: mockCommenter.type,
        },
        reviews: null,
        labels: [],
        linkedIssues: [],
      });
    });

    it('open pull request state', async () => {
      nock('https://api.github.com')
        .get('/repos/gitify-app/notifications-test/pulls/1')
        .reply(200, {
          number: 123,
          state: 'open',
          draft: false,
          merged: false,
          user: mockAuthor,
          labels: [],
        });

      nock('https://api.github.com')
        .get('/repos/gitify-app/notifications-test/issues/comments/302888448')
        .reply(200, { user: mockCommenter });

      nock('https://api.github.com')
        .get('/repos/gitify-app/notifications-test/pulls/1/reviews')
        .reply(200, []);

      const result = await pullRequestHandler.enrich(
        mockNotification,
        mockSettings,
      );

      expect(result).toEqual({
        number: 123,
        state: 'open',
        user: {
          login: mockCommenter.login,
          html_url: mockCommenter.html_url,
          avatar_url: mockCommenter.avatar_url,
          type: mockCommenter.type,
        },
        reviews: null,
        labels: [],
        linkedIssues: [],
      });
    });

    it('avoid fetching comments if latest_comment_url and url are the same', async () => {
      mockNotification.subject.latest_comment_url =
        mockNotification.subject.url;

      nock('https://api.github.com')
        .get('/repos/gitify-app/notifications-test/pulls/1')
        .reply(200, {
          number: 123,
          state: 'open',
          draft: false,
          merged: false,
          user: mockAuthor,
          labels: [],
        });

      nock('https://api.github.com')
        .get('/repos/gitify-app/notifications-test/pulls/1/reviews')
        .reply(200, []);

      const result = await pullRequestHandler.enrich(
        mockNotification,
        mockSettings,
      );

      expect(result).toEqual({
        number: 123,
        state: 'open',
        user: {
          login: mockAuthor.login,
          html_url: mockAuthor.html_url,
          avatar_url: mockAuthor.avatar_url,
          type: mockAuthor.type,
        },
        reviews: null,
        labels: [],
        linkedIssues: [],
      });
    });

    it('handle pull request without latest_comment_url', async () => {
      mockNotification.subject.latest_comment_url = null;

      nock('https://api.github.com')
        .get('/repos/gitify-app/notifications-test/pulls/1')
        .reply(200, {
          number: 123,
          state: 'open',
          draft: false,
          merged: false,
          user: mockAuthor,
          labels: [],
        });

      nock('https://api.github.com')
        .get('/repos/gitify-app/notifications-test/pulls/1/reviews')
        .reply(200, []);

      const result = await pullRequestHandler.enrich(
        mockNotification,
        mockSettings,
      );

      expect(result).toEqual({
        number: 123,
        state: 'open',
        user: {
          login: mockAuthor.login,
          html_url: mockAuthor.html_url,
          avatar_url: mockAuthor.avatar_url,
          type: mockAuthor.type,
        },
        reviews: null,
        labels: [],
        linkedIssues: [],
      });
    });

    describe('Pull Requests With Labels', () => {
      it('with labels', async () => {
        nock('https://api.github.com')
          .get('/repos/gitify-app/notifications-test/pulls/1')
          .reply(200, {
            number: 123,
            state: 'open',
            draft: false,
            merged: false,
            user: mockAuthor,
            labels: [{ name: 'enhancement' }],
          });

        nock('https://api.github.com')
          .get('/repos/gitify-app/notifications-test/issues/comments/302888448')
          .reply(200, { user: mockCommenter });

        nock('https://api.github.com')
          .get('/repos/gitify-app/notifications-test/pulls/1/reviews')
          .reply(200, []);

        const result = await pullRequestHandler.enrich(
          mockNotification,
          mockSettings,
        );

        expect(result).toEqual({
          number: 123,
          state: 'open',
          user: {
            login: mockCommenter.login,
            html_url: mockCommenter.html_url,
            avatar_url: mockCommenter.avatar_url,
            type: mockCommenter.type,
          },
          reviews: null,
          labels: ['enhancement'],
          linkedIssues: [],
        });
      });

      it('handle null labels', async () => {
        nock('https://api.github.com')
          .get('/repos/gitify-app/notifications-test/pulls/1')
          .reply(200, {
            number: 123,
            state: 'open',
            draft: false,
            merged: false,
            user: mockAuthor,
            labels: null,
          });

        nock('https://api.github.com')
          .get('/repos/gitify-app/notifications-test/issues/comments/302888448')
          .reply(200, { user: mockCommenter });

        nock('https://api.github.com')
          .get('/repos/gitify-app/notifications-test/pulls/1/reviews')
          .reply(200, []);

        const result = await pullRequestHandler.enrich(
          mockNotification,
          mockSettings,
        );

        expect(result).toEqual({
          number: 123,
          state: 'open',
          user: {
            login: mockCommenter.login,
            html_url: mockCommenter.html_url,
            avatar_url: mockCommenter.avatar_url,
            type: mockCommenter.type,
          },
          reviews: null,
          labels: [],
          linkedIssues: [],
        });
      });
    });

    describe('Pull Request With Linked Issues', () => {
      it('returns empty if no pr body', () => {
        const mockPr = {
          user: {
            type: 'User',
          },
          body: null,
        } as PullRequest;

        const result = parseLinkedIssuesFromPr(mockPr);
        expect(result).toEqual([]);
      });

      it('returns empty if pr from non-user', () => {
        const mockPr = {
          user: {
            type: 'Bot',
          },
          body: 'This PR is linked to #1, #2, and #3',
        } as PullRequest;
        const result = parseLinkedIssuesFromPr(mockPr);
        expect(result).toEqual([]);
      });

      it('returns linked issues', () => {
        const mockPr = {
          user: {
            type: 'User',
          },
          body: 'This PR is linked to #1, #2, and #3',
        } as PullRequest;
        const result = parseLinkedIssuesFromPr(mockPr);
        expect(result).toEqual(['#1', '#2', '#3']);
      });
    });

    it('early return if pull request state filtered', async () => {
      nock('https://api.github.com')
        .get('/repos/gitify-app/notifications-test/pulls/1')
        .reply(200, {
          number: 123,
          state: 'open',
          draft: false,
          merged: false,
          user: mockAuthor,
          labels: [],
        });

      const result = await pullRequestHandler.enrich(mockNotification, {
        ...mockSettings,
        filterStates: ['closed'],
      });

      expect(result).toEqual(null);
    });

    it('early return if pull request user filtered', async () => {
      nock('https://api.github.com')
        .get('/repos/gitify-app/notifications-test/pulls/1')
        .reply(200, {
          number: 123,
          state: 'open',
          draft: false,
          merged: false,
          user: mockAuthor,
          labels: [],
        });

      nock('https://api.github.com')
        .get('/repos/gitify-app/notifications-test/issues/comments/302888448')
        .reply(200, { user: mockCommenter });

      const result = await pullRequestHandler.enrich(mockNotification, {
        ...mockSettings,
        filterUserTypes: ['Bot'],
      });

      expect(result).toEqual(null);
    });
  });

  it('getIcon', () => {
    expect(
      pullRequestHandler.getIcon(createSubjectMock({ type: 'PullRequest' }))
        .displayName,
    ).toBe('GitPullRequestIcon');

    expect(
      pullRequestHandler.getIcon(
        createSubjectMock({
          type: 'PullRequest',
          state: 'draft',
        }),
      ).displayName,
    ).toBe('GitPullRequestDraftIcon');

    expect(
      pullRequestHandler.getIcon(
        createSubjectMock({
          type: 'PullRequest',
          state: 'closed',
        }),
      ).displayName,
    ).toBe('GitPullRequestClosedIcon');

    expect(
      pullRequestHandler.getIcon(
        createSubjectMock({
          type: 'PullRequest',
          state: 'merged',
        }),
      ).displayName,
    ).toBe('GitMergeIcon');
  });

  describe('Pull Request Reviews - Latest Reviews By Reviewer', () => {
    it('returns latest review state per reviewer', async () => {
      nock('https://api.github.com')
        .get('/repos/gitify-app/notifications-test/pulls/1/reviews')
        .reply(200, [
          {
            user: {
              login: 'reviewer-1',
            },
            state: 'REQUESTED_CHANGES',
          },
          {
            user: {
              login: 'reviewer-2',
            },
            state: 'COMMENTED',
          },
          {
            user: {
              login: 'reviewer-1',
            },
            state: 'APPROVED',
          },
          {
            user: {
              login: 'reviewer-3',
            },
            state: 'APPROVED',
          },
        ]);

      const result = await getLatestReviewForReviewers(mockNotification);

      expect(result).toEqual([
        { state: 'APPROVED', users: ['reviewer-3', 'reviewer-1'] },
        { state: 'COMMENTED', users: ['reviewer-2'] },
      ]);
    });

    it('handles no PR reviews yet', async () => {
      nock('https://api.github.com')
        .get('/repos/gitify-app/notifications-test/pulls/1/reviews')
        .reply(200, []);

      const result = await getLatestReviewForReviewers(mockNotification);

      expect(result).toBeNull();
    });

    it('returns null when not a PR notification', async () => {
      mockNotification.subject.type = 'Issue';

      const result = await getLatestReviewForReviewers(mockNotification);

      expect(result).toBeNull();
    });
  });
});
