import axios from 'axios';
import nock from 'nock';

import { mockAccounts } from '../__mocks__/mock-state';
import { mockedSingleNotification } from '../__mocks__/mockedData';
import {
  getCheckSuiteAttributes,
  getGitifySubjectForDiscussion,
  getGitifySubjectForIssue,
  getGitifySubjectForPullRequest,
  getWorkflowRunAttributes,
} from './subject';
describe('utils/state.ts', () => {
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

  describe('getGitifySubjectForDiscussion', () => {
    it('answered discussion state', async () => {
      const mockNotification = {
        ...mockedSingleNotification,
        subject: {
          ...mockedSingleNotification.subject,
          title: 'This is an answered discussion',
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
                  comments: {
                    nodes: [], //TODO - Update this to have real data
                  },
                },
              ],
            },
          },
        });

      const result = await getGitifySubjectForDiscussion(
        mockNotification,
        mockAccounts.token,
      );

      expect(result.state).toBe('ANSWERED');
      expect(result.user).toBe(null);
    });

    it('duplicate discussion state', async () => {
      const mockNotification = {
        ...mockedSingleNotification,
        subject: {
          ...mockedSingleNotification.subject,
          title: 'This is a duplicate discussion',
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
                  comments: {
                    nodes: [], //TODO - Update this to have real data
                  },
                },
              ],
            },
          },
        });

      const result = await getGitifySubjectForDiscussion(
        mockNotification,
        mockAccounts.token,
      );

      expect(result.state).toBe('DUPLICATE');
      expect(result.user).toBe(null);
    });

    it('open discussion state', async () => {
      const mockNotification = {
        ...mockedSingleNotification,
        subject: {
          ...mockedSingleNotification.subject,
          title: 'This is an open discussion',
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
                  comments: {
                    nodes: [], //TODO - Update this to have real data
                  },
                },
              ],
            },
          },
        });

      const result = await getGitifySubjectForDiscussion(
        mockNotification,
        mockAccounts.token,
      );

      expect(result.state).toBe('OPEN');
      expect(result.user).toBe(null);
    });

    it('outdated discussion state', async () => {
      const mockNotification = {
        ...mockedSingleNotification,
        subject: {
          ...mockedSingleNotification.subject,
          title: 'This is an outdated discussion',
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
                  comments: {
                    nodes: [], //TODO - Update this to have real data
                  },
                },
              ],
            },
          },
        });

      const result = await getGitifySubjectForDiscussion(
        mockNotification,
        mockAccounts.token,
      );

      expect(result.state).toBe('OUTDATED');
      expect(result.user).toBe(null);
    });

    it('reopened discussion state', async () => {
      const mockNotification = {
        ...mockedSingleNotification,
        subject: {
          ...mockedSingleNotification.subject,
          title: 'This is a reopened discussion',
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
                  comments: {
                    nodes: [], //TODO - Update this to have real data
                  },
                },
              ],
            },
          },
        });

      const result = await getGitifySubjectForDiscussion(
        mockNotification,
        mockAccounts.token,
      );

      expect(result.state).toBe('REOPENED');
      expect(result.user).toBe(null);
    });

    it('resolved discussion state', async () => {
      const mockNotification = {
        ...mockedSingleNotification,
        subject: {
          ...mockedSingleNotification.subject,
          title: 'This is a resolved discussion',
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
                  comments: {
                    nodes: [], //TODO - Update this to have real data
                  },
                },
              ],
            },
          },
        });

      const result = await getGitifySubjectForDiscussion(
        mockNotification,
        mockAccounts.token,
      );

      expect(result.state).toBe('RESOLVED');
      expect(result.user).toBe(null);
    });

    it('filtered response by subscribed', async () => {
      const mockNotification = {
        ...mockedSingleNotification,
        subject: {
          ...mockedSingleNotification.subject,
          title: 'This is a discussion',
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
                  comments: {
                    nodes: [], //TODO - Update this to have real data
                  },
                },
                {
                  title: 'This is a discussion',
                  viewerSubscription: 'IGNORED',
                  stateReason: null,
                  isAnswered: true,
                  comments: {
                    nodes: [], //TODO - Update this to have real data
                  },
                },
              ],
            },
          },
        });

      const result = await getGitifySubjectForDiscussion(
        mockNotification,
        mockAccounts.token,
      );

      expect(result.state).toBe('OPEN');
      expect(result.user).toBe(null);
    });

    it('handles unknown or missing results', async () => {});
  });

  describe('getGitifySubjectForIssue', () => {
    it('open issue state', async () => {
      nock('https://api.github.com')
        .get('/repos/manosim/notifications-test/issues/1')
        .reply(200, { state: 'open' });

      nock('https://api.github.com')
        .get('/repos/manosim/notifications-test/issues/comments/302888448')
        .reply(200, { user: { login: 'some-user' } });

      const result = await getGitifySubjectForIssue(
        mockedSingleNotification,
        mockAccounts.token,
      );

      expect(result.state).toBe('open');
      expect(result.user).toBe('some-user');
    });

    it('closed issue state', async () => {
      nock('https://api.github.com')
        .get('/repos/manosim/notifications-test/issues/1')
        .reply(200, { state: 'closed' });

      nock('https://api.github.com')
        .get('/repos/manosim/notifications-test/issues/comments/302888448')
        .reply(200, { user: { login: 'some-user' } });

      const result = await getGitifySubjectForIssue(
        mockedSingleNotification,
        mockAccounts.token,
      );

      expect(result.state).toBe('closed');
      expect(result.user).toBe('some-user');
    });

    it('completed issue state', async () => {
      nock('https://api.github.com')
        .get('/repos/manosim/notifications-test/issues/1')
        .reply(200, { state: 'closed', state_reason: 'completed' });

      nock('https://api.github.com')
        .get('/repos/manosim/notifications-test/issues/comments/302888448')
        .reply(200, { user: { login: 'some-user' } });

      const result = await getGitifySubjectForIssue(
        mockedSingleNotification,
        mockAccounts.token,
      );

      expect(result.state).toBe('completed');
      expect(result.user).toBe('some-user');
    });

    it('not_planned issue state', async () => {
      nock('https://api.github.com')
        .get('/repos/manosim/notifications-test/issues/1')
        .reply(200, { state: 'open', state_reason: 'not_planned' });

      nock('https://api.github.com')
        .get('/repos/manosim/notifications-test/issues/comments/302888448')
        .reply(200, { user: { login: 'some-user' } });

      const result = await getGitifySubjectForIssue(
        mockedSingleNotification,
        mockAccounts.token,
      );

      expect(result.state).toBe('not_planned');
      expect(result.user).toBe('some-user');
    });

    it('reopened issue state', async () => {
      nock('https://api.github.com')
        .get('/repos/manosim/notifications-test/issues/1')
        .reply(200, { state: 'open', state_reason: 'reopened' });

      nock('https://api.github.com')
        .get('/repos/manosim/notifications-test/issues/comments/302888448')
        .reply(200, { user: { login: 'some-user' } });

      const result = await getGitifySubjectForIssue(
        mockedSingleNotification,
        mockAccounts.token,
      );

      expect(result.state).toBe('reopened');
      expect(result.user).toBe('some-user');
    });
  });

  describe('getGitifySubjectForPullRequest', () => {
    it('closed pull request state', async () => {
      nock('https://api.github.com')
        .get('/repos/manosim/notifications-test/issues/1')
        .reply(200, { state: 'closed', draft: false, merged: false });

      nock('https://api.github.com')
        .get('/repos/manosim/notifications-test/issues/comments/302888448')
        .reply(200, { user: { login: 'some-user' } });

      const result = await getGitifySubjectForPullRequest(
        mockedSingleNotification,
        mockAccounts.token,
      );

      expect(result.state).toBe('closed');
      expect(result.user).toBe('some-user');
    });

    it('draft pull request state', async () => {
      nock('https://api.github.com')
        .get('/repos/manosim/notifications-test/issues/1')
        .reply(200, { state: 'open', draft: true, merged: false });

      nock('https://api.github.com')
        .get('/repos/manosim/notifications-test/issues/comments/302888448')
        .reply(200, { user: { login: 'some-user' } });

      const result = await getGitifySubjectForPullRequest(
        mockedSingleNotification,
        mockAccounts.token,
      );

      expect(result.state).toBe('draft');
      expect(result.user).toBe('some-user');
    });

    it('merged pull request state', async () => {
      nock('https://api.github.com')
        .get('/repos/manosim/notifications-test/issues/1')
        .reply(200, { state: 'open', draft: false, merged: true });

      nock('https://api.github.com')
        .get('/repos/manosim/notifications-test/issues/comments/302888448')
        .reply(200, { user: { login: 'some-user' } });

      const result = await getGitifySubjectForPullRequest(
        mockedSingleNotification,
        mockAccounts.token,
      );

      expect(result.state).toBe('merged');
      expect(result.user).toBe('some-user');
    });

    it('open pull request state', async () => {
      nock('https://api.github.com')
        .get('/repos/manosim/notifications-test/issues/1')
        .reply(200, { state: 'open', draft: false, merged: false });

      nock('https://api.github.com')
        .get('/repos/manosim/notifications-test/issues/comments/302888448')
        .reply(200, { user: { login: 'some-user' } });

      const result = await getGitifySubjectForPullRequest(
        mockedSingleNotification,
        mockAccounts.token,
      );

      expect(result.state).toBe('open');
      expect(result.user).toBe('some-user');
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
