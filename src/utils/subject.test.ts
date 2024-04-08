import axios from 'axios';
import nock from 'nock';

import { mockAccounts } from '../__mocks__/mock-state';
import {
  mockedNotificationUser,
  mockedSingleNotification,
} from '../__mocks__/mockedData';
import type { SubjectType } from '../typesGithub';
import {
  getCheckSuiteAttributes,
  getGitifySubjectDetails,
  getWorkflowRunAttributes,
} from './subject';
describe('utils/subject.ts', () => {
  beforeEach(() => {
    // axios will default to using the XHR adapter which can't be intercepted
    // by nock. So, configure axios to use the node adapter.
    axios.defaults.adapter = 'http';
  });

  describe('getCheckSuiteState', () => {
    it('cancelled check suite state', async () => {
      const mockNotification = {
        ...mockedSingleNotification,
        subject: {
          ...mockedSingleNotification.subject,
          title: 'Demo workflow run cancelled for main branch',
        },
      };

      const result = getCheckSuiteAttributes(mockNotification);

      expect(result.workflowName).toBe('Demo');
      expect(result.attemptNumber).toBeNull();
      expect(result.status).toBe('cancelled');
      expect(result.branchName).toBe('main');
    });

    it('failed check suite state', async () => {
      const mockNotification = {
        ...mockedSingleNotification,
        subject: {
          ...mockedSingleNotification.subject,
          title: 'Demo workflow run failed for main branch',
        },
      };

      const result = getCheckSuiteAttributes(mockNotification);

      expect(result.workflowName).toBe('Demo');
      expect(result.attemptNumber).toBeNull();
      expect(result.status).toBe('failure');
      expect(result.branchName).toBe('main');
    });

    it('multiple attempts failed check suite state', async () => {
      const mockNotification = {
        ...mockedSingleNotification,
        subject: {
          ...mockedSingleNotification.subject,
          title: 'Demo workflow run, Attempt #3 failed for main branch',
        },
      };

      const result = getCheckSuiteAttributes(mockNotification);

      expect(result.workflowName).toBe('Demo');
      expect(result.attemptNumber).toBe(3);
      expect(result.status).toBe('failure');
      expect(result.branchName).toBe('main');
    });

    it('skipped check suite state', async () => {
      const mockNotification = {
        ...mockedSingleNotification,
        subject: {
          ...mockedSingleNotification.subject,
          title: 'Demo workflow run skipped for main branch',
        },
      };

      const result = getCheckSuiteAttributes(mockNotification);

      expect(result.workflowName).toBe('Demo');
      expect(result.attemptNumber).toBeNull();
      expect(result.status).toBe('skipped');
      expect(result.branchName).toBe('main');
    });

    it('successful check suite state', async () => {
      const mockNotification = {
        ...mockedSingleNotification,
        subject: {
          ...mockedSingleNotification.subject,
          title: 'Demo workflow run succeeded for main branch',
        },
      };

      const result = getCheckSuiteAttributes(mockNotification);

      expect(result.workflowName).toBe('Demo');
      expect(result.attemptNumber).toBeNull();
      expect(result.status).toBe('success');
      expect(result.branchName).toBe('main');
    });

    it('unknown check suite state', async () => {
      const mockNotification = {
        ...mockedSingleNotification,
        subject: {
          ...mockedSingleNotification.subject,
          title: 'Demo workflow run unknown-status for main branch',
        },
      };

      const result = getCheckSuiteAttributes(mockNotification);

      expect(result.workflowName).toBe('Demo');
      expect(result.attemptNumber).toBeNull();
      expect(result.status).toBeNull();
      expect(result.branchName).toBe('main');
    });

    it('unhandled check suite title', async () => {
      const mockNotification = {
        ...mockedSingleNotification,
        subject: {
          ...mockedSingleNotification.subject,
          title: 'A title that is not in the structure we expect',
        },
      };

      const result = getCheckSuiteAttributes(mockNotification);

      expect(result).toBeNull();
    });
  });

  describe('getGitifySubjectDetails', () => {
    describe('Discussions', () => {
      it('answered discussion state', async () => {
        const mockNotification = {
          ...mockedSingleNotification,
          subject: {
            ...mockedSingleNotification.subject,
            title: 'This is an answered discussion',
            type: 'Discussion' as SubjectType,
          },
        };

        nock('https://api.github.com')
          .post('/graphql')
          .reply(200, {
            data: {
              search: {
                nodes: [
                  {
                    title: 'This is an answered discussion',
                    viewerSubscription: 'SUBSCRIBED',
                    stateReason: null,
                    isAnswered: true,
                    author: {
                      login: 'discussion-creator',
                      url: 'https://github.com/discussion-creator',
                      avatar_url:
                        'https://avatars.githubusercontent.com/u/583231?v=4',
                      type: 'User',
                    },
                    comments: {
                      nodes: [], //TODO - Update this to have real data
                    },
                  },
                ],
              },
            },
          });

        const result = await getGitifySubjectDetails(
          mockNotification,
          mockAccounts.token,
        );

        expect(result.state).toBe('ANSWERED');
        expect(result.user).toEqual({
          login: 'discussion-creator',
          html_url: 'https://github.com/discussion-creator',
          avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
          type: 'User',
        });
      });

      it('duplicate discussion state', async () => {
        const mockNotification = {
          ...mockedSingleNotification,
          subject: {
            ...mockedSingleNotification.subject,
            title: 'This is a duplicate discussion',
            type: 'Discussion' as SubjectType,
          },
        };

        nock('https://api.github.com')
          .post('/graphql')
          .reply(200, {
            data: {
              search: {
                nodes: [
                  {
                    title: 'This is a duplicate discussion',
                    viewerSubscription: 'SUBSCRIBED',
                    stateReason: 'DUPLICATE',
                    isAnswered: false,
                    author: {
                      login: 'discussion-creator',
                      url: 'https://github.com/discussion-creator',
                      avatar_url:
                        'https://avatars.githubusercontent.com/u/583231?v=4',
                      type: 'User',
                    },
                    comments: {
                      nodes: [], //TODO - Update this to have real data
                    },
                  },
                ],
              },
            },
          });

        const result = await getGitifySubjectDetails(
          mockNotification,
          mockAccounts.token,
        );

        expect(result.state).toBe('DUPLICATE');
        expect(result.user).toEqual({
          login: 'discussion-creator',
          html_url: 'https://github.com/discussion-creator',
          avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
          type: 'User',
        });
      });

      it('open discussion state', async () => {
        const mockNotification = {
          ...mockedSingleNotification,
          subject: {
            ...mockedSingleNotification.subject,
            title: 'This is an open discussion',
            type: 'Discussion' as SubjectType,
          },
        };

        nock('https://api.github.com')
          .post('/graphql')
          .reply(200, {
            data: {
              search: {
                nodes: [
                  {
                    title: 'This is an open discussion',
                    viewerSubscription: 'SUBSCRIBED',
                    stateReason: null,
                    isAnswered: false,
                    author: {
                      login: 'discussion-creator',
                      url: 'https://github.com/discussion-creator',
                      avatar_url:
                        'https://avatars.githubusercontent.com/u/583231?v=4',
                      type: 'User',
                    },
                    comments: {
                      nodes: [], //TODO - Update this to have real data
                    },
                  },
                ],
              },
            },
          });

        const result = await getGitifySubjectDetails(
          mockNotification,
          mockAccounts.token,
        );

        expect(result.state).toBe('OPEN');
        expect(result.user).toEqual({
          login: 'discussion-creator',
          html_url: 'https://github.com/discussion-creator',
          avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
          type: 'User',
        });
      });

      it('outdated discussion state', async () => {
        const mockNotification = {
          ...mockedSingleNotification,
          subject: {
            ...mockedSingleNotification.subject,
            title: 'This is an outdated discussion',
            type: 'Discussion' as SubjectType,
          },
        };

        nock('https://api.github.com')
          .post('/graphql')
          .reply(200, {
            data: {
              search: {
                nodes: [
                  {
                    title: 'This is an outdated discussion',
                    viewerSubscription: 'SUBSCRIBED',
                    stateReason: 'OUTDATED',
                    isAnswered: false,
                    author: {
                      login: 'discussion-creator',
                      url: 'https://github.com/discussion-creator',
                      avatar_url:
                        'https://avatars.githubusercontent.com/u/583231?v=4',
                      type: 'User',
                    },
                    comments: {
                      nodes: [], //TODO - Update this to have real data
                    },
                  },
                ],
              },
            },
          });

        const result = await getGitifySubjectDetails(
          mockNotification,
          mockAccounts.token,
        );

        expect(result.state).toBe('OUTDATED');
        expect(result.user).toEqual({
          login: 'discussion-creator',
          html_url: 'https://github.com/discussion-creator',
          avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
          type: 'User',
        });
      });

      it('reopened discussion state', async () => {
        const mockNotification = {
          ...mockedSingleNotification,
          subject: {
            ...mockedSingleNotification.subject,
            title: 'This is a reopened discussion',
            type: 'Discussion' as SubjectType,
          },
        };

        nock('https://api.github.com')
          .post('/graphql')
          .reply(200, {
            data: {
              search: {
                nodes: [
                  {
                    title: 'This is a reopened discussion',
                    viewerSubscription: 'SUBSCRIBED',
                    stateReason: 'REOPENED',
                    isAnswered: false,
                    author: {
                      login: 'discussion-creator',
                      url: 'https://github.com/discussion-creator',
                      avatar_url:
                        'https://avatars.githubusercontent.com/u/583231?v=4',
                      type: 'User',
                    },
                    comments: {
                      nodes: [], //TODO - Update this to have real data
                    },
                  },
                ],
              },
            },
          });

        const result = await getGitifySubjectDetails(
          mockNotification,
          mockAccounts.token,
        );

        expect(result.state).toBe('REOPENED');
        expect(result.user).toEqual({
          login: 'discussion-creator',
          html_url: 'https://github.com/discussion-creator',
          avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
          type: 'User',
        });
      });

      it('resolved discussion state', async () => {
        const mockNotification = {
          ...mockedSingleNotification,
          subject: {
            ...mockedSingleNotification.subject,
            title: 'This is a resolved discussion',
            type: 'Discussion' as SubjectType,
          },
        };

        nock('https://api.github.com')
          .post('/graphql')
          .reply(200, {
            data: {
              search: {
                nodes: [
                  {
                    title: 'This is a resolved discussion',
                    viewerSubscription: 'SUBSCRIBED',
                    stateReason: 'RESOLVED',
                    isAnswered: false,
                    author: {
                      login: 'discussion-creator',
                      url: 'https://github.com/discussion-creator',
                      avatar_url:
                        'https://avatars.githubusercontent.com/u/583231?v=4',
                      type: 'User',
                    },
                    comments: {
                      nodes: [], //TODO - Update this to have real data
                    },
                  },
                ],
              },
            },
          });

        const result = await getGitifySubjectDetails(
          mockNotification,
          mockAccounts.token,
        );

        expect(result.state).toBe('RESOLVED');
        expect(result.user).toEqual({
          login: 'discussion-creator',
          html_url: 'https://github.com/discussion-creator',
          avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
          type: 'User',
        });
      });

      it('filtered response by subscribed', async () => {
        const mockNotification = {
          ...mockedSingleNotification,
          subject: {
            ...mockedSingleNotification.subject,
            title: 'This is a discussion',
            type: 'Discussion' as SubjectType,
          },
        };

        nock('https://api.github.com')
          .post('/graphql')
          .reply(200, {
            data: {
              search: {
                nodes: [
                  {
                    title: 'This is a discussion',
                    viewerSubscription: 'SUBSCRIBED',
                    stateReason: null,
                    isAnswered: false,
                    author: {
                      login: 'discussion-creator',
                      url: 'https://github.com/discussion-creator',
                      avatar_url:
                        'https://avatars.githubusercontent.com/u/583231?v=4',
                      type: 'User',
                    },
                    comments: {
                      nodes: [], //TODO - Update this to have real data
                    },
                  },
                  {
                    title: 'This is a discussion',
                    viewerSubscription: 'IGNORED',
                    stateReason: null,
                    isAnswered: true,
                    author: {
                      login: 'discussion-creator',
                      url: 'https://github.com/discussion-creator',
                      avatar_url:
                        'https://avatars.githubusercontent.com/u/583231?v=4',
                      type: 'User',
                    },
                    comments: {
                      nodes: [], //TODO - Update this to have real data
                    },
                  },
                ],
              },
            },
          });

        const result = await getGitifySubjectDetails(
          mockNotification,
          mockAccounts.token,
        );

        expect(result.state).toBe('OPEN');
        expect(result.user).toEqual({
          login: 'discussion-creator',
          html_url: 'https://github.com/discussion-creator',
          avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
          type: 'User',
        });
      });
    });

    describe('Issues', () => {
      it('open issue state', async () => {
        nock('https://api.github.com')
          .get('/repos/manosim/notifications-test/issues/1')
          .reply(200, { state: 'open', user: { login: 'some-user' } });

        nock('https://api.github.com')
          .get('/repos/manosim/notifications-test/issues/comments/302888448')
          .reply(200, { user: { login: 'some-commenter' } });

        const result = await getGitifySubjectDetails(
          mockedSingleNotification,
          mockAccounts.token,
        );

        expect(result.state).toBe('open');
        expect(result.user).toEqual({ login: 'some-commenter' });
      });

      it('closed issue state', async () => {
        nock('https://api.github.com')
          .get('/repos/manosim/notifications-test/issues/1')
          .reply(200, { state: 'closed', user: { login: 'some-user' } });

        nock('https://api.github.com')
          .get('/repos/manosim/notifications-test/issues/comments/302888448')
          .reply(200, { user: { login: 'some-commenter' } });

        const result = await getGitifySubjectDetails(
          mockedSingleNotification,
          mockAccounts.token,
        );

        expect(result.state).toBe('closed');
        expect(result.user).toEqual({ login: 'some-commenter' });
      });

      it('completed issue state', async () => {
        nock('https://api.github.com')
          .get('/repos/manosim/notifications-test/issues/1')
          .reply(200, {
            state: 'closed',
            state_reason: 'completed',
            user: { login: 'some-user' },
          });

        nock('https://api.github.com')
          .get('/repos/manosim/notifications-test/issues/comments/302888448')
          .reply(200, { user: { login: 'some-commenter' } });

        const result = await getGitifySubjectDetails(
          mockedSingleNotification,
          mockAccounts.token,
        );

        expect(result.state).toBe('completed');
        expect(result.user).toEqual({ login: 'some-commenter' });
      });

      it('not_planned issue state', async () => {
        nock('https://api.github.com')
          .get('/repos/manosim/notifications-test/issues/1')
          .reply(200, {
            state: 'open',
            state_reason: 'not_planned',
            user: { login: 'some-user' },
          });

        nock('https://api.github.com')
          .get('/repos/manosim/notifications-test/issues/comments/302888448')
          .reply(200, { user: { login: 'some-commenter' } });

        const result = await getGitifySubjectDetails(
          mockedSingleNotification,
          mockAccounts.token,
        );

        expect(result.state).toBe('not_planned');
        expect(result.user).toEqual({ login: 'some-commenter' });
      });

      it('reopened issue state', async () => {
        nock('https://api.github.com')
          .get('/repos/manosim/notifications-test/issues/1')
          .reply(200, {
            state: 'open',
            state_reason: 'reopened',
            user: { login: 'some-user' },
          });

        nock('https://api.github.com')
          .get('/repos/manosim/notifications-test/issues/comments/302888448')
          .reply(200, { user: { login: 'some-commenter' } });

        const result = await getGitifySubjectDetails(
          mockedSingleNotification,
          mockAccounts.token,
        );

        expect(result.state).toBe('reopened');
        expect(result.user).toEqual({ login: 'some-commenter' });
      });

      it('handle issues without latest_comment_url', async () => {
        nock('https://api.github.com')
          .get('/repos/manosim/notifications-test/issues/1')
          .reply(200, {
            state: 'open',
            draft: false,
            merged: false,
            user: { login: 'some-user' },
          });

        const result = await getGitifySubjectDetails(
          {
            ...mockedSingleNotification,
            subject: {
              ...mockedSingleNotification.subject,
              latest_comment_url: null,
            },
          },
          mockAccounts.token,
        );

        expect(result.state).toBe('open');
        expect(result.user).toEqual({ login: 'some-user' });
      });
    });

    describe('Pull Requests', () => {
      const mockNotification = {
        ...mockedSingleNotification,
        subject: {
          ...mockedSingleNotification.subject,
          type: 'PullRequest' as SubjectType,
        },
      };

      it('closed pull request state', async () => {
        nock('https://api.github.com')
          .get('/repos/manosim/notifications-test/issues/1')
          .reply(200, {
            state: 'closed',
            draft: false,
            merged: false,
            user: { login: 'some-user' },
          });

        nock('https://api.github.com')
          .get('/repos/manosim/notifications-test/issues/comments/302888448')
          .reply(200, { user: { login: 'some-commenter' } });

        const result = await getGitifySubjectDetails(
          mockNotification,
          mockAccounts.token,
        );

        expect(result.state).toBe('closed');
        expect(result.user).toEqual({ login: 'some-commenter' });
      });

      it('draft pull request state', async () => {
        nock('https://api.github.com')
          .get('/repos/manosim/notifications-test/issues/1')
          .reply(200, {
            state: 'open',
            draft: true,
            merged: false,
            user: { login: 'some-user' },
          });

        nock('https://api.github.com')
          .get('/repos/manosim/notifications-test/issues/comments/302888448')
          .reply(200, { user: { login: 'some-commenter' } });

        const result = await getGitifySubjectDetails(
          mockNotification,
          mockAccounts.token,
        );

        expect(result.state).toBe('draft');
        expect(result.user).toEqual({ login: 'some-commenter' });
      });

      it('merged pull request state', async () => {
        nock('https://api.github.com')
          .get('/repos/manosim/notifications-test/issues/1')
          .reply(200, {
            state: 'open',
            draft: false,
            merged: true,
            user: { login: 'some-user' },
          });

        nock('https://api.github.com')
          .get('/repos/manosim/notifications-test/issues/comments/302888448')
          .reply(200, { user: { login: 'some-commenter' } });

        const result = await getGitifySubjectDetails(
          mockNotification,
          mockAccounts.token,
        );

        expect(result.state).toBe('merged');
        expect(result.user).toEqual({ login: 'some-commenter' });
      });

      it('open pull request state', async () => {
        nock('https://api.github.com')
          .get('/repos/manosim/notifications-test/issues/1')
          .reply(200, {
            state: 'open',
            draft: false,
            merged: false,
            user: { login: 'some-user' },
          });

        nock('https://api.github.com')
          .get('/repos/manosim/notifications-test/issues/comments/302888448')
          .reply(200, { user: { login: 'some-commenter' } });

        const result = await getGitifySubjectDetails(
          mockNotification,
          mockAccounts.token,
        );

        expect(result.state).toBe('open');
        expect(result.user).toEqual({ login: 'some-commenter' });
      });

      it('handle pull request without latest_comment_url', async () => {
        nock('https://api.github.com')
          .get('/repos/manosim/notifications-test/issues/1')
          .reply(200, {
            state: 'open',
            draft: false,
            merged: false,
            user: { login: 'some-user' },
          });

        const result = await getGitifySubjectDetails(
          {
            ...mockNotification,
            subject: {
              ...mockNotification.subject,
              latest_comment_url: null,
            },
          },
          mockAccounts.token,
        );

        expect(result.state).toBe('open');
        expect(result.user).toEqual({ login: 'some-user' });
      });
    });
  });

  describe('getGitifySubjectForRelease', () => {
    it('release notification', async () => {
      const mockNotification = {
        ...mockedSingleNotification,
        subject: {
          ...mockedSingleNotification.subject,
          type: 'Release' as SubjectType,
          url: 'https://api.github.com/repos/manosim/notifications-test/releases/1',
          latest_comment_url:
            'https://api.github.com/repos/manosim/notifications-test/releases/1',
        },
      };

      nock('https://api.github.com')
        .get('/repos/manosim/notifications-test/releases/1')
        .reply(200, { author: mockedNotificationUser });

      const result = await getGitifySubjectDetails(
        mockNotification,
        mockAccounts.token,
      );

      expect(result.user).toEqual({
        login: 'octocat',
        html_url: 'https://github.com/octocat',
        avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
        type: 'User',
      });
    });
  });

  describe('getWorkflowRunState', () => {
    it('deploy review workflow run state', async () => {
      const mockNotification = {
        ...mockedSingleNotification,
        subject: {
          ...mockedSingleNotification.subject,
          title: 'some-user requested your review to deploy to an environment',
        },
      };

      const result = getWorkflowRunAttributes(mockNotification);

      expect(result.status).toBe('waiting');
      expect(result.user).toBe('some-user');
    });

    it('unknown workflow run state', async () => {
      const mockNotification = {
        ...mockedSingleNotification,
        subject: {
          ...mockedSingleNotification.subject,
          title:
            'some-user requested your unknown-state to deploy to an environment',
        },
      };

      const result = getWorkflowRunAttributes(mockNotification);

      expect(result.status).toBeNull();
      expect(result.user).toBe('some-user');
    });

    it('unhandled workflow run title', async () => {
      const mockNotification = {
        ...mockedSingleNotification,
        subject: {
          ...mockedSingleNotification.subject,
          title: 'unhandled workflow run structure',
        },
      };

      const result = getWorkflowRunAttributes(mockNotification);

      expect(result).toBeNull();
    });
  });
});
