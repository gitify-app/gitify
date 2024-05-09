import type { AxiosPromise, AxiosResponse } from 'axios';
import { mockAccounts } from '../__mocks__/mock-state';
import {
  mockedGraphQLResponse,
  mockedSingleNotification,
  mockedUser,
} from '../__mocks__/mockedData';
import type { SubjectType } from '../typesGitHub';
import * as apiRequests from './api/request';
import {
  addNotificationReferrerIdToUrl,
  formatForDisplay,
  generateGitHubWebUrl,
  generateNotificationReferrerId,
  getGitHubAPIBaseUrl,
  isEnterpriseHost,
  isGitHubLoggedIn,
} from './helpers';

describe('utils/helpers.ts', () => {
  describe('isGitHubLoggedIn', () => {
    it('logged in', () => {
      expect(isGitHubLoggedIn({ ...mockAccounts, token: '1234' })).toBe(true);
    });

    it('logged out', () => {
      expect(isGitHubLoggedIn({ ...mockAccounts, token: null })).toBe(false);
    });
  });
  describe('isEnterpriseHost', () => {
    it('should return true for enterprise host', () => {
      expect(isEnterpriseHost('github.gitify.app')).toBe(true);
      expect(isEnterpriseHost('api.github.gitify.app')).toBe(true);
    });

    it('should return false for non-enterprise host', () => {
      expect(isEnterpriseHost('github.com')).toBe(false);
      expect(isEnterpriseHost('api.github.com')).toBe(false);
    });
  });

  describe('addNotificationReferrerIdToUrl', () => {
    it('should add notification_referrer_id to the URL', () => {
      // Mock data
      const url = 'https://github.com/gitify-app/notifications-test';
      const notificationId = '123';
      const userId = 456;

      const result = addNotificationReferrerIdToUrl(
        url,
        notificationId,
        userId,
      );

      expect(result).toEqual(
        'https://github.com/gitify-app/notifications-test?notification_referrer_id=MDE4Ok5vdGlmaWNhdGlvblRocmVhZDEyMzo0NTY%3D',
      );
    });

    it('should add notification_referrer_id to the URL, preserving anchor tags', () => {
      // Mock data
      const url =
        'https://github.com/gitify-app/notifications-test/pull/123#issuecomment-1951055051';
      const notificationId = '123';
      const userId = 456;

      const result = addNotificationReferrerIdToUrl(
        url,
        notificationId,
        userId,
      );

      expect(result).toEqual(
        'https://github.com/gitify-app/notifications-test/pull/123?notification_referrer_id=MDE4Ok5vdGlmaWNhdGlvblRocmVhZDEyMzo0NTY%3D#issuecomment-1951055051',
      );
    });
  });

  describe('generateNotificationReferrerId', () => {
    it('should generate the notification_referrer_id', () => {
      const referrerId = generateNotificationReferrerId(
        mockedSingleNotification.id,
        mockedUser.id,
      );
      expect(referrerId).toBe(
        'MDE4Ok5vdGlmaWNhdGlvblRocmVhZDEzODY2MTA5NjoxMjM0NTY3ODk=',
      );
    });
  });

  describe('generateGitHubAPIUrl', () => {
    it('should generate a GitHub API url - non enterprise', () => {
      const result = getGitHubAPIBaseUrl('github.com');
      expect(result).toBe('https://api.github.com');
    });

    it('should generate a GitHub API url - enterprise', () => {
      const result = getGitHubAPIBaseUrl('github.gitify.app');
      expect(result).toBe('https://github.gitify.app/api/v3');
    });
  });

  describe('generateGitHubWebUrl', () => {
    const mockedHtmlUrl =
      'https://github.com/gitify-app/notifications-test/issues/785';
    const mockedNotificationReferrer =
      'notification_referrer_id=MDE4Ok5vdGlmaWNhdGlvblRocmVhZDEzODY2MTA5NjoxMjM0NTY3ODk%3D';
    const apiRequestAuthMock = jest.spyOn(apiRequests, 'apiRequestAuth');

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('Subject Latest Comment Url: when not null, fetch latest comment html url', async () => {
      const subject = {
        title: 'generate github web url unit tests',
        url: 'https://api.github.com/repos/gitify-app/notifications-test/issues/1',
        latest_comment_url:
          'https://api.github.com/repos/gitify-app/notifications-test/issues/comments/302888448',
        type: 'Issue' as SubjectType,
      };

      const requestPromise = new Promise((resolve) =>
        resolve({
          data: {
            html_url: mockedHtmlUrl,
          },
        } as AxiosResponse),
      ) as AxiosPromise;

      apiRequestAuthMock.mockResolvedValue(requestPromise);

      const result = await generateGitHubWebUrl(
        {
          ...mockedSingleNotification,
          subject: subject,
        },
        mockAccounts,
      );

      expect(apiRequestAuthMock).toHaveBeenCalledTimes(1);
      expect(apiRequestAuthMock).toHaveBeenCalledWith(
        subject.latest_comment_url,
        'GET',
        mockAccounts.token,
      );
      expect(result).toBe(`${mockedHtmlUrl}?${mockedNotificationReferrer}`);
    });

    it('Subject Url: when no latest comment url available, fetch subject html url', async () => {
      const subject = {
        title: 'generate github web url unit tests',
        url: 'https://api.github.com/repos/gitify-app/notifications-test/issues/1',
        latest_comment_url: null,
        type: 'Issue' as SubjectType,
      };

      const requestPromise = new Promise((resolve) =>
        resolve({
          data: {
            html_url: mockedHtmlUrl,
          },
        } as AxiosResponse),
      ) as AxiosPromise;

      apiRequestAuthMock.mockResolvedValue(requestPromise);

      const result = await generateGitHubWebUrl(
        {
          ...mockedSingleNotification,
          subject: subject,
        },
        mockAccounts,
      );

      expect(apiRequestAuthMock).toHaveBeenCalledTimes(1);
      expect(apiRequestAuthMock).toHaveBeenCalledWith(
        subject.url,
        'GET',
        mockAccounts.token,
      );
      expect(result).toBe(`${mockedHtmlUrl}?${mockedNotificationReferrer}`);
    });

    describe('Check Suite URLs', () => {
      it('successful workflow', async () => {
        const subject = {
          title: 'Demo workflow run succeeded for main branch',
          url: null,
          latest_comment_url: null,
          type: 'CheckSuite' as SubjectType,
        };

        const result = await generateGitHubWebUrl(
          {
            ...mockedSingleNotification,
            subject: subject,
          },
          mockAccounts,
        );

        expect(apiRequestAuthMock).toHaveBeenCalledTimes(0);
        expect(result).toBe(
          `https://github.com/gitify-app/notifications-test/actions?query=workflow%3A%22Demo%22+is%3Asuccess+branch%3Amain&${mockedNotificationReferrer}`,
        );
      });

      it('failed workflow', async () => {
        const subject = {
          title: 'Demo workflow run failed for main branch',
          url: null,
          latest_comment_url: null,
          type: 'CheckSuite' as SubjectType,
        };

        const result = await generateGitHubWebUrl(
          {
            ...mockedSingleNotification,
            subject: subject,
          },
          mockAccounts,
        );

        expect(apiRequestAuthMock).toHaveBeenCalledTimes(0);
        expect(result).toBe(
          `https://github.com/gitify-app/notifications-test/actions?query=workflow%3A%22Demo%22+is%3Afailure+branch%3Amain&${mockedNotificationReferrer}`,
        );
      });

      it('failed workflow multiple attempts', async () => {
        const subject = {
          title: 'Demo workflow run, Attempt #3 failed for main branch',
          url: null,
          latest_comment_url: null,
          type: 'CheckSuite' as SubjectType,
        };

        const result = await generateGitHubWebUrl(
          {
            ...mockedSingleNotification,
            subject: subject,
          },
          mockAccounts,
        );

        expect(apiRequestAuthMock).toHaveBeenCalledTimes(0);
        expect(result).toBe(
          `https://github.com/gitify-app/notifications-test/actions?query=workflow%3A%22Demo%22+is%3Afailure+branch%3Amain&${mockedNotificationReferrer}`,
        );
      });

      it('skipped workflow', async () => {
        const subject = {
          title: 'Demo workflow run skipped for main branch',
          url: null,
          latest_comment_url: null,
          type: 'CheckSuite' as SubjectType,
        };

        const result = await generateGitHubWebUrl(
          {
            ...mockedSingleNotification,
            subject: subject,
          },
          mockAccounts,
        );

        expect(apiRequestAuthMock).toHaveBeenCalledTimes(0);
        expect(result).toBe(
          `https://github.com/gitify-app/notifications-test/actions?query=workflow%3A%22Demo%22+is%3Askipped+branch%3Amain&${mockedNotificationReferrer}`,
        );
      });

      it('unhandled workflow scenario', async () => {
        const subject = {
          title: 'unhandled workflow scenario',
          url: null,
          latest_comment_url: null,
          type: 'CheckSuite' as SubjectType,
        };

        const result = await generateGitHubWebUrl(
          {
            ...mockedSingleNotification,
            subject: subject,
          },
          mockAccounts,
        );

        expect(apiRequestAuthMock).toHaveBeenCalledTimes(0);
        expect(result).toBe(
          `https://github.com/gitify-app/notifications-test/actions?${mockedNotificationReferrer}`,
        );
      });

      it('unhandled status scenario', async () => {
        const subject = {
          title: 'Demo workflow run unhandled-status for main branch',
          url: null,
          latest_comment_url: null,
          type: 'CheckSuite' as SubjectType,
        };

        const result = await generateGitHubWebUrl(
          {
            ...mockedSingleNotification,
            subject: subject,
          },
          mockAccounts,
        );

        expect(apiRequestAuthMock).toHaveBeenCalledTimes(0);
        expect(result).toBe(
          `https://github.com/gitify-app/notifications-test/actions?query=workflow%3A%22Demo%22+branch%3Amain&${mockedNotificationReferrer}`,
        );
      });

      it('unhandled check suite scenario', async () => {
        const subject = {
          title: 'Unhandled scenario',
          url: null,
          latest_comment_url: null,
          type: 'CheckSuite' as SubjectType,
        };

        const result = await generateGitHubWebUrl(
          {
            ...mockedSingleNotification,
            subject: subject,
          },
          mockAccounts,
        );

        expect(apiRequestAuthMock).toHaveBeenCalledTimes(0);
        expect(result).toBe(
          `https://github.com/gitify-app/notifications-test/actions?${mockedNotificationReferrer}`,
        );
      });
    });

    describe('Discussions URLs', () => {
      it('when no subject urls and no discussions found via query, default to linking to repository discussions', async () => {
        const subject = {
          title: 'generate github web url unit tests',
          url: null,
          latest_comment_url: null,
          type: 'Discussion' as SubjectType,
        };

        const requestPromise = new Promise((resolve) =>
          resolve({
            data: { data: { search: { nodes: [] } } },
          } as AxiosResponse),
        ) as AxiosPromise;

        apiRequestAuthMock.mockResolvedValue(requestPromise);

        const result = await generateGitHubWebUrl(
          {
            ...mockedSingleNotification,
            subject: subject,
          },
          mockAccounts,
        );

        expect(apiRequestAuthMock).toHaveBeenCalledTimes(1);
        expect(result).toBe(
          `${mockedSingleNotification.repository.html_url}/discussions?${mockedNotificationReferrer}`,
        );
      });

      it('link to matching discussion and comment hash', async () => {
        const subject = {
          title: '1.16.0',
          url: null,
          latest_comment_url: null,
          type: 'Discussion' as SubjectType,
        };

        const requestPromise = new Promise((resolve) =>
          resolve({
            data: {
              ...mockedGraphQLResponse,
            },
          } as AxiosResponse),
        ) as AxiosPromise;

        apiRequestAuthMock.mockResolvedValue(requestPromise);

        const result = await generateGitHubWebUrl(
          {
            ...mockedSingleNotification,
            subject: subject,
          },
          mockAccounts,
        );

        expect(apiRequestAuthMock).toHaveBeenCalledTimes(1);
        expect(result).toBe(
          `https://github.com/gitify-app/notifications-test/discussions/612?${mockedNotificationReferrer}#discussioncomment-2300902`,
        );
      });

      it('default to base discussions url when graphql query fails', async () => {
        const subject = {
          title: '1.16.0',
          url: null,
          latest_comment_url: null,
          type: 'Discussion' as SubjectType,
        };

        const requestPromise = new Promise((resolve) =>
          resolve(null as AxiosResponse),
        ) as AxiosPromise;

        apiRequestAuthMock.mockResolvedValue(requestPromise);

        const result = await generateGitHubWebUrl(
          {
            ...mockedSingleNotification,
            subject: subject,
          },
          mockAccounts,
        );

        expect(apiRequestAuthMock).toHaveBeenCalledTimes(1);
        expect(result).toBe(
          `https://github.com/gitify-app/notifications-test/discussions?${mockedNotificationReferrer}`,
        );
      });
    });

    it('Repository Invitation url', async () => {
      const subject = {
        title:
          'Invitation to join gitify-app/notifications-test from unit-tests',
        url: null,
        latest_comment_url: null,
        type: 'RepositoryInvitation' as SubjectType,
      };

      const result = await generateGitHubWebUrl(
        {
          ...mockedSingleNotification,
          subject: subject,
        },
        mockAccounts,
      );

      expect(apiRequestAuthMock).toHaveBeenCalledTimes(0);
      expect(result).toBe(
        `https://github.com/gitify-app/notifications-test/invitations?${mockedNotificationReferrer}`,
      );
    });

    describe('Workflow Run URLs', () => {
      it('approval requested', async () => {
        const subject = {
          title: 'some-user requested your review to deploy to an environment',
          url: null,
          latest_comment_url: null,
          type: 'WorkflowRun' as SubjectType,
        };

        const result = await generateGitHubWebUrl(
          {
            ...mockedSingleNotification,
            subject: subject,
          },
          mockAccounts,
        );

        expect(apiRequestAuthMock).toHaveBeenCalledTimes(0);
        expect(result).toBe(
          `https://github.com/gitify-app/notifications-test/actions?query=is%3Awaiting&${mockedNotificationReferrer}`,
        );
      });

      it('unhandled status/action scenario', async () => {
        const subject = {
          title:
            'some-user requested your unhandled-action to deploy to an environment',
          url: null,
          latest_comment_url: null,
          type: 'WorkflowRun' as SubjectType,
        };

        const result = await generateGitHubWebUrl(
          {
            ...mockedSingleNotification,
            subject: subject,
          },
          mockAccounts,
        );

        expect(apiRequestAuthMock).toHaveBeenCalledTimes(0);
        expect(result).toBe(
          `https://github.com/gitify-app/notifications-test/actions?${mockedNotificationReferrer}`,
        );
      });

      it('unhandled workflow scenario', async () => {
        const subject = {
          title: 'some unhandled scenario',
          url: null,
          latest_comment_url: null,
          type: 'WorkflowRun' as SubjectType,
        };

        const result = await generateGitHubWebUrl(
          {
            ...mockedSingleNotification,
            subject: subject,
          },
          mockAccounts,
        );

        expect(apiRequestAuthMock).toHaveBeenCalledTimes(0);
        expect(result).toBe(
          `https://github.com/gitify-app/notifications-test/actions?${mockedNotificationReferrer}`,
        );
      });
    });

    it('defaults to repository url', async () => {
      const subject = {
        title: 'generate github web url unit tests',
        url: null,
        latest_comment_url: null,
        type: 'Issue' as SubjectType,
      };

      const result = await generateGitHubWebUrl(
        {
          ...mockedSingleNotification,
          subject: subject,
        },
        mockAccounts,
      );

      expect(apiRequestAuthMock).toHaveBeenCalledTimes(0);
      expect(result).toBe(
        `${mockedSingleNotification.repository.html_url}?${mockedNotificationReferrer}`,
      );
    });

    it('formatForDisplay', () => {
      expect(formatForDisplay(null)).toBe('');
      expect(formatForDisplay([])).toBe('');
      expect(formatForDisplay(['open', 'PullRequest'])).toBe(
        'Open Pull Request',
      );
      expect(formatForDisplay(['OUTDATED', 'Discussion'])).toBe(
        'Outdated Discussion',
      );
      expect(formatForDisplay(['not_planned', 'Issue'])).toBe(
        'Not Planned Issue',
      );
    });
  });
});
