import axios from 'axios';
import nock from 'nock';

import {
  partialMockNotification,
  partialMockUser,
} from '../__mocks__/partial-mocks';
import type { Link } from '../types';
import type {
  Discussion,
  DiscussionAuthor,
  DiscussionStateType,
  Notification,
  PullRequest,
  Repository,
} from '../typesGitHub';
import {
  getCheckSuiteAttributes,
  getGitifySubjectDetails,
  getLatestReviewForReviewers,
  getWorkflowRunAttributes,
  parseLinkedIssuesFromPr,
} from './subject';

const mockAuthor = partialMockUser('some-author');
const mockCommenter = partialMockUser('some-commenter');
const mockDiscussionAuthor: DiscussionAuthor = {
  login: 'discussion-author',
  url: 'https://github.com/discussion-author' as Link,
  avatar_url: 'https://avatars.githubusercontent.com/u/123456789?v=4' as Link,
  type: 'User',
};

describe('utils/subject.ts', () => {
  beforeEach(() => {
    // axios will default to using the XHR adapter which can't be intercepted
    // by nock. So, configure axios to use the node adapter.
    axios.defaults.adapter = 'http';
  });

  describe('getGitifySubjectDetails', () => {
    describe('CheckSuites - GitHub Actions', () => {
      it('cancelled check suite state', async () => {
        const mockNotification = partialMockNotification({
          title: 'Demo workflow run cancelled for main branch',
          type: 'CheckSuite',
        });

        const result = await getGitifySubjectDetails(mockNotification);

        expect(result).toEqual({
          state: 'cancelled',
          user: null,
        });
      });

      it('failed check suite state', async () => {
        const mockNotification = partialMockNotification({
          title: 'Demo workflow run failed for main branch',
          type: 'CheckSuite',
        });

        const result = await getGitifySubjectDetails(mockNotification);

        expect(result).toEqual({
          state: 'failure',
          user: null,
        });
      });

      it('multiple attempts failed check suite state', async () => {
        const mockNotification = partialMockNotification({
          title: 'Demo workflow run, Attempt #3 failed for main branch',
          type: 'CheckSuite',
        });

        const result = await getGitifySubjectDetails(mockNotification);

        expect(result).toEqual({
          state: 'failure',
          user: null,
        });
      });

      it('skipped check suite state', async () => {
        const mockNotification = partialMockNotification({
          title: 'Demo workflow run skipped for main branch',
          type: 'CheckSuite',
        });

        const result = await getGitifySubjectDetails(mockNotification);

        expect(result).toEqual({
          state: 'skipped',
          user: null,
        });
      });

      it('successful check suite state', async () => {
        const mockNotification = partialMockNotification({
          title: 'Demo workflow run succeeded for main branch',
          type: 'CheckSuite',
        });

        const result = await getGitifySubjectDetails(mockNotification);

        expect(result).toEqual({
          state: 'success',
          user: null,
        });
      });

      it('unknown check suite state', async () => {
        const mockNotification = partialMockNotification({
          title: 'Demo workflow run unknown-status for main branch',
          type: 'CheckSuite',
        });

        const result = await getGitifySubjectDetails(mockNotification);

        expect(result).toBeNull();
      });

      it('unhandled check suite title', async () => {
        const mockNotification = partialMockNotification({
          title: 'A title that is not in the structure we expect',
          type: 'CheckSuite',
        });

        const result = await getGitifySubjectDetails(mockNotification);

        expect(result).toBeNull();
      });
    });
    describe('Commits', () => {
      it('get commit commenter', async () => {
        const mockNotification = partialMockNotification({
          title: 'This is a commit with comments',
          type: 'Commit',
          url: 'https://api.github.com/repos/gitify-app/notifications-test/commits/d2a86d80e3d24ea9510d5de6c147e53c30f313a8' as Link,
          latest_comment_url:
            'https://api.github.com/repos/gitify-app/notifications-test/comments/141012658' as Link,
        });

        nock('https://api.github.com')
          .get(
            '/repos/gitify-app/notifications-test/commits/d2a86d80e3d24ea9510d5de6c147e53c30f313a8',
          )
          .reply(200, { author: mockAuthor });

        nock('https://api.github.com')
          .get('/repos/gitify-app/notifications-test/comments/141012658')
          .reply(200, { user: mockCommenter });

        const result = await getGitifySubjectDetails(mockNotification);

        expect(result).toEqual({
          state: null,
          user: {
            login: mockCommenter.login,
            html_url: mockCommenter.html_url,
            avatar_url: mockCommenter.avatar_url,
            type: mockCommenter.type,
          },
        });
      });

      it('get commit without commenter', async () => {
        const mockNotification = partialMockNotification({
          title: 'This is a commit with comments',
          type: 'Commit',
          url: 'https://api.github.com/repos/gitify-app/notifications-test/commits/d2a86d80e3d24ea9510d5de6c147e53c30f313a8' as Link,
          latest_comment_url: null,
        });

        nock('https://api.github.com')
          .get(
            '/repos/gitify-app/notifications-test/commits/d2a86d80e3d24ea9510d5de6c147e53c30f313a8',
          )
          .reply(200, { author: mockAuthor });

        const result = await getGitifySubjectDetails(mockNotification);

        expect(result).toEqual({
          state: null,
          user: {
            login: mockAuthor.login,
            html_url: mockAuthor.html_url,
            avatar_url: mockAuthor.avatar_url,
            type: mockAuthor.type,
          },
        });
      });
    });

    describe('Discussions', () => {
      const partialRepository: Partial<Repository> = {
        full_name: 'gitify-app/notifications-test',
      };

      const mockNotification = partialMockNotification({
        title: 'This is a mock discussion',
        type: 'Discussion',
      });
      mockNotification.updated_at = '2024-01-01T00:00:00Z';
      mockNotification.repository = {
        ...(partialRepository as Repository),
      };

      it('answered discussion state', async () => {
        nock('https://api.github.com')
          .post('/graphql')
          .reply(200, {
            data: {
              search: {
                nodes: [mockDiscussionNode(null, true)],
              },
            },
          });

        const result = await getGitifySubjectDetails(mockNotification);

        expect(result).toEqual({
          state: 'ANSWERED',
          user: {
            login: mockDiscussionAuthor.login,
            html_url: mockDiscussionAuthor.url,
            avatar_url: mockDiscussionAuthor.avatar_url,
            type: mockDiscussionAuthor.type,
          },
          comments: 0,
          labels: [],
        });
      });

      it('duplicate discussion state', async () => {
        nock('https://api.github.com')
          .post('/graphql')
          .reply(200, {
            data: {
              search: {
                nodes: [mockDiscussionNode('DUPLICATE', false)],
              },
            },
          });

        const result = await getGitifySubjectDetails(mockNotification);

        expect(result).toEqual({
          state: 'DUPLICATE',
          user: {
            login: mockDiscussionAuthor.login,
            html_url: mockDiscussionAuthor.url,
            avatar_url: mockDiscussionAuthor.avatar_url,
            type: mockDiscussionAuthor.type,
          },
          comments: 0,
          labels: [],
        });
      });

      it('open discussion state', async () => {
        nock('https://api.github.com')
          .post('/graphql')
          .reply(200, {
            data: {
              search: {
                nodes: [mockDiscussionNode(null, false)],
              },
            },
          });

        const result = await getGitifySubjectDetails(mockNotification);

        expect(result).toEqual({
          state: 'OPEN',
          user: {
            login: mockDiscussionAuthor.login,
            html_url: mockDiscussionAuthor.url,
            avatar_url: mockDiscussionAuthor.avatar_url,
            type: mockDiscussionAuthor.type,
          },
          comments: 0,
          labels: [],
        });
      });

      it('outdated discussion state', async () => {
        nock('https://api.github.com')
          .post('/graphql')
          .reply(200, {
            data: {
              search: {
                nodes: [mockDiscussionNode('OUTDATED', false)],
              },
            },
          });

        const result = await getGitifySubjectDetails(mockNotification);

        expect(result).toEqual({
          state: 'OUTDATED',
          user: {
            login: mockDiscussionAuthor.login,
            html_url: mockDiscussionAuthor.url,
            avatar_url: mockDiscussionAuthor.avatar_url,
            type: mockDiscussionAuthor.type,
          },
          comments: 0,
          labels: [],
        });
      });

      it('reopened discussion state', async () => {
        nock('https://api.github.com')
          .post('/graphql')
          .reply(200, {
            data: {
              search: {
                nodes: [mockDiscussionNode('REOPENED', false)],
              },
            },
          });

        const result = await getGitifySubjectDetails(mockNotification);

        expect(result).toEqual({
          state: 'REOPENED',
          user: {
            login: mockDiscussionAuthor.login,
            html_url: mockDiscussionAuthor.url,
            avatar_url: mockDiscussionAuthor.avatar_url,
            type: mockDiscussionAuthor.type,
          },
          comments: 0,
          labels: [],
        });
      });

      it('resolved discussion state', async () => {
        nock('https://api.github.com')
          .post('/graphql')
          .reply(200, {
            data: {
              search: {
                nodes: [mockDiscussionNode('RESOLVED', true)],
              },
            },
          });

        const result = await getGitifySubjectDetails(mockNotification);

        expect(result).toEqual({
          state: 'RESOLVED',
          user: {
            login: mockDiscussionAuthor.login,
            html_url: mockDiscussionAuthor.url,
            avatar_url: mockDiscussionAuthor.avatar_url,
            type: mockDiscussionAuthor.type,
          },
          comments: 0,
          labels: [],
        });
      });

      it('discussion with labels', async () => {
        const mockDiscussion = mockDiscussionNode(null, true);
        mockDiscussion.labels = {
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
              search: {
                nodes: [mockDiscussion],
              },
            },
          });

        const result = await getGitifySubjectDetails(mockNotification);

        expect(result).toEqual({
          state: 'ANSWERED',
          user: {
            login: mockDiscussionAuthor.login,
            html_url: mockDiscussionAuthor.url,
            avatar_url: mockDiscussionAuthor.avatar_url,
            type: mockDiscussionAuthor.type,
          },
          comments: 0,
          labels: ['enhancement'],
        });
      });
    });

    describe('Issues', () => {
      let mockNotification: Notification;
      beforeEach(() => {
        mockNotification = partialMockNotification({
          title: 'This is a mock issue',
          type: 'Issue',
          url: 'https://api.github.com/repos/gitify-app/notifications-test/issues/1' as Link,
          latest_comment_url:
            'https://api.github.com/repos/gitify-app/notifications-test/issues/comments/302888448' as Link,
        });
      });

      it('open issue state', async () => {
        nock('https://api.github.com')
          .get('/repos/gitify-app/notifications-test/issues/1')
          .reply(200, { state: 'open', user: mockAuthor, labels: [] });

        nock('https://api.github.com')
          .get('/repos/gitify-app/notifications-test/issues/comments/302888448')
          .reply(200, { user: mockCommenter });

        const result = await getGitifySubjectDetails(mockNotification);

        expect(result).toEqual({
          state: 'open',
          user: {
            login: mockCommenter.login,
            html_url: mockCommenter.html_url,
            avatar_url: mockCommenter.avatar_url,
            type: mockCommenter.type,
          },
          labels: [],
        });
      });

      it('closed issue state', async () => {
        nock('https://api.github.com')
          .get('/repos/gitify-app/notifications-test/issues/1')
          .reply(200, { state: 'closed', user: mockAuthor, labels: [] });

        nock('https://api.github.com')
          .get('/repos/gitify-app/notifications-test/issues/comments/302888448')
          .reply(200, { user: mockCommenter });

        const result = await getGitifySubjectDetails(mockNotification);

        expect(result).toEqual({
          state: 'closed',
          user: {
            login: mockCommenter.login,
            html_url: mockCommenter.html_url,
            avatar_url: mockCommenter.avatar_url,
            type: mockCommenter.type,
          },
          labels: [],
        });
      });

      it('completed issue state', async () => {
        nock('https://api.github.com')
          .get('/repos/gitify-app/notifications-test/issues/1')
          .reply(200, {
            state: 'closed',
            state_reason: 'completed',
            user: mockAuthor,
            labels: [],
          });

        nock('https://api.github.com')
          .get('/repos/gitify-app/notifications-test/issues/comments/302888448')
          .reply(200, { user: mockCommenter });

        const result = await getGitifySubjectDetails(mockNotification);

        expect(result).toEqual({
          state: 'completed',
          user: {
            login: mockCommenter.login,
            html_url: mockCommenter.html_url,
            avatar_url: mockCommenter.avatar_url,
            type: mockCommenter.type,
          },
          labels: [],
        });
      });

      it('not_planned issue state', async () => {
        nock('https://api.github.com')
          .get('/repos/gitify-app/notifications-test/issues/1')
          .reply(200, {
            state: 'open',
            state_reason: 'not_planned',
            user: mockAuthor,
            labels: [],
          });

        nock('https://api.github.com')
          .get('/repos/gitify-app/notifications-test/issues/comments/302888448')
          .reply(200, { user: mockCommenter });

        const result = await getGitifySubjectDetails(mockNotification);

        expect(result).toEqual({
          state: 'not_planned',
          user: {
            login: mockCommenter.login,
            html_url: mockCommenter.html_url,
            avatar_url: mockCommenter.avatar_url,
            type: mockCommenter.type,
          },
          labels: [],
        });
      });

      it('reopened issue state', async () => {
        nock('https://api.github.com')
          .get('/repos/gitify-app/notifications-test/issues/1')
          .reply(200, {
            state: 'open',
            state_reason: 'reopened',
            user: mockAuthor,
            labels: [],
          });

        nock('https://api.github.com')
          .get('/repos/gitify-app/notifications-test/issues/comments/302888448')
          .reply(200, { user: mockCommenter });

        const result = await getGitifySubjectDetails(mockNotification);

        expect(result).toEqual({
          state: 'reopened',
          user: {
            login: mockCommenter.login,
            html_url: mockCommenter.html_url,
            avatar_url: mockCommenter.avatar_url,
            type: mockCommenter.type,
          },
          labels: [],
        });
      });

      it('handle issues without latest_comment_url', async () => {
        mockNotification.subject.latest_comment_url = null;

        nock('https://api.github.com')
          .get('/repos/gitify-app/notifications-test/issues/1')
          .reply(200, {
            state: 'open',
            draft: false,
            merged: false,
            user: mockAuthor,
            labels: [],
          });

        const result = await getGitifySubjectDetails(mockNotification);

        expect(result).toEqual({
          state: 'open',
          user: {
            login: mockAuthor.login,
            html_url: mockAuthor.html_url,
            avatar_url: mockAuthor.avatar_url,
            type: mockAuthor.type,
          },
          labels: [],
        });
      });

      describe('Issue With Labels', () => {
        it('with labels', async () => {
          nock('https://api.github.com')
            .get('/repos/gitify-app/notifications-test/issues/1')
            .reply(200, {
              state: 'open',
              user: mockAuthor,
              labels: [{ name: 'enhancement' }],
            });

          nock('https://api.github.com')
            .get(
              '/repos/gitify-app/notifications-test/issues/comments/302888448',
            )
            .reply(200, { user: mockCommenter });

          const result = await getGitifySubjectDetails(mockNotification);

          expect(result).toEqual({
            state: 'open',
            user: {
              login: mockCommenter.login,
              html_url: mockCommenter.html_url,
              avatar_url: mockCommenter.avatar_url,
              type: mockCommenter.type,
            },
            labels: ['enhancement'],
          });
        });

        it('handle null labels', async () => {
          nock('https://api.github.com')
            .get('/repos/gitify-app/notifications-test/issues/1')
            .reply(200, {
              state: 'open',
              user: mockAuthor,
              labels: null,
            });

          nock('https://api.github.com')
            .get(
              '/repos/gitify-app/notifications-test/issues/comments/302888448',
            )
            .reply(200, { user: mockCommenter });

          const result = await getGitifySubjectDetails(mockNotification);

          expect(result).toEqual({
            state: 'open',
            user: {
              login: mockCommenter.login,
              html_url: mockCommenter.html_url,
              avatar_url: mockCommenter.avatar_url,
              type: mockCommenter.type,
            },
            labels: [],
          });
        });
      });
    });

    describe('Pull Requests', () => {
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

      it('closed pull request state', async () => {
        nock('https://api.github.com')
          .get('/repos/gitify-app/notifications-test/pulls/1')
          .reply(200, {
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

        const result = await getGitifySubjectDetails(mockNotification);

        expect(result).toEqual({
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

        const result = await getGitifySubjectDetails(mockNotification);

        expect(result).toEqual({
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

        const result = await getGitifySubjectDetails(mockNotification);

        expect(result).toEqual({
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

        const result = await getGitifySubjectDetails(mockNotification);

        expect(result).toEqual({
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
            state: 'open',
            draft: false,
            merged: false,
            user: mockAuthor,
            labels: [],
          });

        nock('https://api.github.com')
          .get('/repos/gitify-app/notifications-test/pulls/1/reviews')
          .reply(200, []);

        const result = await getGitifySubjectDetails(mockNotification);

        expect(result).toEqual({
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
            state: 'open',
            draft: false,
            merged: false,
            user: mockAuthor,
            labels: [],
          });

        nock('https://api.github.com')
          .get('/repos/gitify-app/notifications-test/pulls/1/reviews')
          .reply(200, []);

        const result = await getGitifySubjectDetails(mockNotification);

        expect(result).toEqual({
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

      describe('Pull Requests With Labels', () => {
        it('with labels', async () => {
          nock('https://api.github.com')
            .get('/repos/gitify-app/notifications-test/pulls/1')
            .reply(200, {
              state: 'open',
              draft: false,
              merged: false,
              user: mockAuthor,
              labels: [{ name: 'enhancement' }],
            });

          nock('https://api.github.com')
            .get(
              '/repos/gitify-app/notifications-test/issues/comments/302888448',
            )
            .reply(200, { user: mockCommenter });

          nock('https://api.github.com')
            .get('/repos/gitify-app/notifications-test/pulls/1/reviews')
            .reply(200, []);

          const result = await getGitifySubjectDetails(mockNotification);

          expect(result).toEqual({
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
              state: 'open',
              draft: false,
              merged: false,
              user: mockAuthor,
              labels: null,
            });

          nock('https://api.github.com')
            .get(
              '/repos/gitify-app/notifications-test/issues/comments/302888448',
            )
            .reply(200, { user: mockCommenter });

          nock('https://api.github.com')
            .get('/repos/gitify-app/notifications-test/pulls/1/reviews')
            .reply(200, []);

          const result = await getGitifySubjectDetails(mockNotification);

          expect(result).toEqual({
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
    });

    describe('Releases', () => {
      it('release notification', async () => {
        const mockNotification = partialMockNotification({
          title: 'This is a mock release',
          type: 'Release',
          url: 'https://api.github.com/repos/gitify-app/notifications-test/releases/1' as Link,
          latest_comment_url:
            'https://api.github.com/repos/gitify-app/notifications-test/releases/1' as Link,
        });

        nock('https://api.github.com')
          .get('/repos/gitify-app/notifications-test/releases/1')
          .reply(200, { author: mockAuthor });

        const result = await getGitifySubjectDetails(mockNotification);

        expect(result).toEqual({
          state: null,
          user: {
            login: mockAuthor.login,
            html_url: mockAuthor.html_url,
            avatar_url: mockAuthor.avatar_url,
            type: mockAuthor.type,
          },
        });
      });
    });

    describe('WorkflowRuns - GitHub Actions', () => {
      it('deploy review workflow run state', async () => {
        const mockNotification = partialMockNotification({
          title: 'some-user requested your review to deploy to an environment',
          type: 'WorkflowRun',
        });

        const result = await getGitifySubjectDetails(mockNotification);

        expect(result).toEqual({
          state: 'waiting',
          user: null,
        });
      });

      it('unknown workflow run state', async () => {
        const mockNotification = partialMockNotification({
          title:
            'some-user requested your unknown-state to deploy to an environment',
          type: 'WorkflowRun',
        });

        const result = await getGitifySubjectDetails(mockNotification);

        expect(result).toBeNull();
      });

      it('unhandled workflow run title', async () => {
        const mockNotification = partialMockNotification({
          title: 'unhandled workflow run structure',
          type: 'WorkflowRun',
        });

        const result = await getGitifySubjectDetails(mockNotification);

        expect(result).toBeNull();
      });
    });

    describe('Default', () => {
      it('unhandled subject details', async () => {
        const mockNotification = partialMockNotification({
          title:
            'There is no special subject handling for this notification type',
          type: 'RepositoryInvitation',
        });

        const result = await getGitifySubjectDetails(mockNotification);

        expect(result).toBeNull();
      });
    });

    describe('Error', () => {
      it('catches error and logs message', async () => {
        const consoleErrorSpy = jest
          .spyOn(console, 'error')
          .mockImplementation();

        const mockError = new Error('Test error');
        const mockNotification = partialMockNotification({
          title: 'This issue will throw an error',
          type: 'Issue',
          url: 'https://api.github.com/repos/gitify-app/notifications-test/issues/1' as Link,
        });

        nock('https://api.github.com')
          .get('/repos/gitify-app/notifications-test/issues/1')
          .replyWithError(mockError);

        await getGitifySubjectDetails(mockNotification);

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error occurred while fetching details for Issue notification: This issue will throw an error',
          mockError,
        );
      });
    });
  });

  describe('getCheckSuiteState', () => {
    it('cancelled check suite state', async () => {
      const mockNotification = partialMockNotification({
        title: 'Demo workflow run cancelled for feature/foo branch',
        type: 'CheckSuite',
      });

      const result = getCheckSuiteAttributes(mockNotification);

      expect(result).toEqual({
        workflowName: 'Demo',
        attemptNumber: null,
        status: 'cancelled',
        statusDisplayName: 'cancelled',
        branchName: 'feature/foo',
      });
    });

    it('failed check suite state', async () => {
      const mockNotification = partialMockNotification({
        title: 'Demo workflow run failed for main branch',
        type: 'CheckSuite',
      });

      const result = getCheckSuiteAttributes(mockNotification);

      expect(result).toEqual({
        workflowName: 'Demo',
        attemptNumber: null,
        status: 'failure',
        statusDisplayName: 'failed',
        branchName: 'main',
      });
    });

    it('multiple attempts failed check suite state', async () => {
      const mockNotification = partialMockNotification({
        title: 'Demo workflow run, Attempt #3 failed for main branch',
        type: 'CheckSuite',
      });

      const result = getCheckSuiteAttributes(mockNotification);

      expect(result).toEqual({
        workflowName: 'Demo',
        attemptNumber: 3,
        status: 'failure',
        statusDisplayName: 'failed',
        branchName: 'main',
      });
    });

    it('skipped check suite state', async () => {
      const mockNotification = partialMockNotification({
        title: 'Demo workflow run skipped for main branch',
        type: 'CheckSuite',
      });

      const result = getCheckSuiteAttributes(mockNotification);

      expect(result).toEqual({
        workflowName: 'Demo',
        attemptNumber: null,
        status: 'skipped',
        statusDisplayName: 'skipped',
        branchName: 'main',
      });
    });

    it('successful check suite state', async () => {
      const mockNotification = partialMockNotification({
        title: 'Demo workflow run succeeded for main branch',
        type: 'CheckSuite',
      });

      const result = getCheckSuiteAttributes(mockNotification);

      expect(result).toEqual({
        workflowName: 'Demo',
        attemptNumber: null,
        status: 'success',
        statusDisplayName: 'succeeded',
        branchName: 'main',
      });
    });

    it('unknown check suite state', async () => {
      const mockNotification = partialMockNotification({
        title: 'Demo workflow run unknown-status for main branch',
        type: 'CheckSuite',
      });

      const result = getCheckSuiteAttributes(mockNotification);

      expect(result).toEqual({
        workflowName: 'Demo',
        attemptNumber: null,
        status: null,
        statusDisplayName: 'unknown-status',
        branchName: 'main',
      });
    });

    it('unhandled check suite title', async () => {
      const mockNotification = partialMockNotification({
        title: 'A title that is not in the structure we expect',
        type: 'CheckSuite',
      });

      const result = getCheckSuiteAttributes(mockNotification);

      expect(result).toBeNull();
    });
  });

  describe('getWorkflowRunState', () => {
    it('deploy review workflow run state', async () => {
      const mockNotification = partialMockNotification({
        title: 'some-user requested your review to deploy to an environment',
        type: 'WorkflowRun',
      });

      const result = getWorkflowRunAttributes(mockNotification);

      expect(result).toEqual({
        status: 'waiting',
        statusDisplayName: 'review',
        user: 'some-user',
      });
    });

    it('unknown workflow run state', async () => {
      const mockNotification = partialMockNotification({
        title:
          'some-user requested your unknown-state to deploy to an environment',
        type: 'WorkflowRun',
      });

      const result = getWorkflowRunAttributes(mockNotification);

      expect(result).toEqual({
        status: null,
        statusDisplayName: 'unknown-state',
        user: 'some-user',
      });
    });

    it('unhandled workflow run title', async () => {
      const mockNotification = partialMockNotification({
        title: 'unhandled workflow run structure',
        type: 'WorkflowRun',
      });

      const result = getWorkflowRunAttributes(mockNotification);

      expect(result).toBeNull();
    });
  });
});

function mockDiscussionNode(
  state: DiscussionStateType,
  isAnswered: boolean,
): Discussion {
  return {
    title: 'This is a mock discussion',
    url: 'https://github.com/gitify-app/notifications-test/discussions/1' as Link,
    stateReason: state,
    isAnswered: isAnswered,
    author: mockDiscussionAuthor,
    comments: {
      nodes: [],
      totalCount: 0,
    },
    labels: null,
  };
}
