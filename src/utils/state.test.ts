import axios from 'axios';
import nock from 'nock';

import { mockAccounts } from '../__mocks__/mock-state';
import { mockedSingleNotification } from '../__mocks__/mockedData';
import {
  parseCheckSuiteTitle,
  getDiscussionState,
  getIssueState,
  getPullRequestState,
} from './state';
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

      const result = parseCheckSuiteTitle(mockNotification);

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

      const result = parseCheckSuiteTitle(mockNotification);

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

      const result = parseCheckSuiteTitle(mockNotification);

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

      const result = parseCheckSuiteTitle(mockNotification);

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

      const result = parseCheckSuiteTitle(mockNotification);

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

      const result = parseCheckSuiteTitle(mockNotification);

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

      const result = parseCheckSuiteTitle(mockNotification);

      expect(result).toBeNull();
    });
  });

  describe('getDiscussionState', () => {
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
              edges: [
                {
                  node: {
                    title: 'This is an answered discussion',
                    viewerSubscription: 'SUBSCRIBED',
                    stateReason: null,
                    isAnswered: true,
                  },
                },
              ],
            },
          },
        });

      const result = await getDiscussionState(
        mockNotification,
        mockAccounts.token,
      );

      expect(result).toBe('ANSWERED');
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
              edges: [
                {
                  node: {
                    title: 'This is a duplicate discussion',
                    viewerSubscription: 'SUBSCRIBED',
                    stateReason: 'DUPLICATE',
                    isAnswered: false,
                  },
                },
              ],
            },
          },
        });

      const result = await getDiscussionState(
        mockNotification,
        mockAccounts.token,
      );

      expect(result).toBe('DUPLICATE');
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
              edges: [
                {
                  node: {
                    title: 'This is an open discussion',
                    viewerSubscription: 'SUBSCRIBED',
                    stateReason: null,
                    isAnswered: false,
                  },
                },
              ],
            },
          },
        });

      const result = await getDiscussionState(
        mockNotification,
        mockAccounts.token,
      );

      expect(result).toBe('OPEN');
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
              edges: [
                {
                  node: {
                    title: 'This is an outdated discussion',
                    viewerSubscription: 'SUBSCRIBED',
                    stateReason: 'OUTDATED',
                    isAnswered: false,
                  },
                },
              ],
            },
          },
        });

      const result = await getDiscussionState(
        mockNotification,
        mockAccounts.token,
      );

      expect(result).toBe('OUTDATED');
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
              edges: [
                {
                  node: {
                    title: 'This is a reopened discussion',
                    viewerSubscription: 'SUBSCRIBED',
                    stateReason: 'REOPENED',
                    isAnswered: false,
                  },
                },
              ],
            },
          },
        });

      const result = await getDiscussionState(
        mockNotification,
        mockAccounts.token,
      );

      expect(result).toBe('REOPENED');
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
              edges: [
                {
                  node: {
                    title: 'This is a resolved discussion',
                    viewerSubscription: 'SUBSCRIBED',
                    stateReason: 'RESOLVED',
                    isAnswered: false,
                  },
                },
              ],
            },
          },
        });

      const result = await getDiscussionState(
        mockNotification,
        mockAccounts.token,
      );

      expect(result).toBe('RESOLVED');
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
              edges: [
                {
                  node: {
                    title: 'This is a discussion',
                    viewerSubscription: 'SUBSCRIBED',
                    stateReason: null,
                    isAnswered: false,
                  },
                },
                {
                  node: {
                    title: 'This is a discussion',
                    viewerSubscription: 'IGNORED',
                    stateReason: null,
                    isAnswered: true,
                  },
                },
              ],
            },
          },
        });

      const result = await getDiscussionState(
        mockNotification,
        mockAccounts.token,
      );

      expect(result).toBe('OPEN');
    });

    it('handles unknown or missing results', async () => {});
  });

  describe('getIssueState', () => {
    it('open issue state', async () => {
      nock('https://api.github.com')
        .get('/repos/manosim/notifications-test/issues/1')
        .reply(200, { state: 'open' });

      const result = await getIssueState(
        mockedSingleNotification,
        mockAccounts.token,
      );

      expect(result).toBe('open');
    });

    it('closed issue state', async () => {
      nock('https://api.github.com')
        .get('/repos/manosim/notifications-test/issues/1')
        .reply(200, { state: 'closed' });

      const result = await getIssueState(
        mockedSingleNotification,
        mockAccounts.token,
      );

      expect(result).toBe('closed');
    });

    it('completed issue state', async () => {
      nock('https://api.github.com')
        .get('/repos/manosim/notifications-test/issues/1')
        .reply(200, { state: 'closed', state_reason: 'completed' });

      const result = await getIssueState(
        mockedSingleNotification,
        mockAccounts.token,
      );

      expect(result).toBe('completed');
    });

    it('not_planned issue state', async () => {
      nock('https://api.github.com')
        .get('/repos/manosim/notifications-test/issues/1')
        .reply(200, { state: 'open', state_reason: 'not_planned' });

      const result = await getIssueState(
        mockedSingleNotification,
        mockAccounts.token,
      );

      expect(result).toBe('not_planned');
    });

    it('reopened issue state', async () => {
      nock('https://api.github.com')
        .get('/repos/manosim/notifications-test/issues/1')
        .reply(200, { state: 'open', state_reason: 'reopened' });

      const result = await getIssueState(
        mockedSingleNotification,
        mockAccounts.token,
      );

      expect(result).toBe('reopened');
    });
  });

  describe('getPullRequestState', () => {
    it('closed pull request state', async () => {
      nock('https://api.github.com')
        .get('/repos/manosim/notifications-test/issues/1')
        .reply(200, { state: 'closed', draft: false, merged: false });

      const result = await getPullRequestState(
        mockedSingleNotification,
        mockAccounts.token,
      );

      expect(result).toBe('closed');
    });

    it('draft pull request state', async () => {
      nock('https://api.github.com')
        .get('/repos/manosim/notifications-test/issues/1')
        .reply(200, { state: 'open', draft: true, merged: false });

      const result = await getPullRequestState(
        mockedSingleNotification,
        mockAccounts.token,
      );

      expect(result).toBe('draft');
    });

    it('merged pull request state', async () => {
      nock('https://api.github.com')
        .get('/repos/manosim/notifications-test/issues/1')
        .reply(200, { state: 'open', draft: false, merged: true });

      const result = await getPullRequestState(
        mockedSingleNotification,
        mockAccounts.token,
      );

      expect(result).toBe('merged');
    });

    it('open pull request state', async () => {
      nock('https://api.github.com')
        .get('/repos/manosim/notifications-test/issues/1')
        .reply(200, { state: 'open', draft: false, merged: false });

      const result = await getPullRequestState(
        mockedSingleNotification,
        mockAccounts.token,
      );

      expect(result).toBe('open');
    });
  });
});
