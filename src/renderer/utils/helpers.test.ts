import type { AxiosPromise, AxiosResponse } from 'axios';
import { mockPersonalAccessTokenAccount } from '../__mocks__/state-mocks';

import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@primer/octicons-react';

import * as logger from '../../shared/logger';
import type { Hostname, Link } from '../types';
import type { SubjectType } from '../typesGitHub';
import {
  mockGraphQLResponse,
  mockSingleNotification,
} from './api/__mocks__/response-mocks';
import * as apiRequests from './api/request';

import {
  formatForDisplay,
  generateGitHubWebUrl,
  generateNotificationReferrerId,
  getChevronDetails,
  getPlatformFromHostname,
  isEnterpriseServerHost,
} from './helpers';

describe('renderer/utils/helpers.ts', () => {
  describe('getPlatformFromHostname', () => {
    it('should return GitHub Cloud', () => {
      expect(getPlatformFromHostname('github.com' as Hostname)).toBe(
        'GitHub Cloud',
      );
      expect(getPlatformFromHostname('api.github.com' as Hostname)).toBe(
        'GitHub Cloud',
      );
    });

    it('should return GitHub Enterprise Server', () => {
      expect(getPlatformFromHostname('github.gitify.app' as Hostname)).toBe(
        'GitHub Enterprise Server',
      );
      expect(getPlatformFromHostname('api.github.gitify.app' as Hostname)).toBe(
        'GitHub Enterprise Server',
      );
    });
  });

  describe('isEnterpriseServerHost', () => {
    it('should return true for enterprise host', () => {
      expect(isEnterpriseServerHost('github.gitify.app' as Hostname)).toBe(
        true,
      );
      expect(isEnterpriseServerHost('api.github.gitify.app' as Hostname)).toBe(
        true,
      );
    });

    it('should return false for non-enterprise host', () => {
      expect(isEnterpriseServerHost('github.com' as Hostname)).toBe(false);
      expect(isEnterpriseServerHost('api.github.com' as Hostname)).toBe(false);
    });
  });

  describe('generateNotificationReferrerId', () => {
    it('should generate the notification_referrer_id', () => {
      const referrerId = generateNotificationReferrerId(mockSingleNotification);
      expect(referrerId).toBe(
        'MDE4Ok5vdGlmaWNhdGlvblRocmVhZDEzODY2MTA5NjoxMjM0NTY3ODk=',
      );
    });
  });

  describe('generateGitHubWebUrl', () => {
    const mockHtmlUrl =
      'https://github.com/gitify-app/notifications-test/issues/785';
    const mockNotificationReferrer =
      'notification_referrer_id=MDE4Ok5vdGlmaWNhdGlvblRocmVhZDEzODY2MTA5NjoxMjM0NTY3ODk%3D';
    const apiRequestAuthMock = jest.spyOn(apiRequests, 'apiRequestAuth');

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('Subject Latest Comment Url: when not null, fetch latest comment html url', async () => {
      const subject = {
        title: 'generate github web url unit tests',
        url: 'https://api.github.com/repos/gitify-app/notifications-test/issues/1' as Link,
        latest_comment_url:
          'https://api.github.com/repos/gitify-app/notifications-test/issues/comments/302888448' as Link,
        type: 'Issue' as SubjectType,
      };

      const requestPromise = new Promise((resolve) =>
        resolve({
          data: {
            html_url: mockHtmlUrl,
          },
        } as AxiosResponse),
      ) as AxiosPromise;

      apiRequestAuthMock.mockResolvedValue(requestPromise);

      const result = await generateGitHubWebUrl({
        ...mockSingleNotification,
        subject: subject,
      });

      expect(apiRequestAuthMock).toHaveBeenCalledTimes(1);
      expect(apiRequestAuthMock).toHaveBeenCalledWith(
        subject.latest_comment_url,
        'GET',
        mockPersonalAccessTokenAccount.token,
      );
      expect(result).toBe(`${mockHtmlUrl}?${mockNotificationReferrer}`);
    });

    it('Subject Url: when no latest comment url available, fetch subject html url', async () => {
      const subject = {
        title: 'generate github web url unit tests',
        url: 'https://api.github.com/repos/gitify-app/notifications-test/issues/1' as Link,
        latest_comment_url: null,
        type: 'Issue' as SubjectType,
      };

      const requestPromise = new Promise((resolve) =>
        resolve({
          data: {
            html_url: mockHtmlUrl,
          },
        } as AxiosResponse),
      ) as AxiosPromise;

      apiRequestAuthMock.mockResolvedValue(requestPromise);

      const result = await generateGitHubWebUrl({
        ...mockSingleNotification,
        subject: subject,
      });

      expect(apiRequestAuthMock).toHaveBeenCalledTimes(1);
      expect(apiRequestAuthMock).toHaveBeenCalledWith(
        subject.url,
        'GET',
        mockPersonalAccessTokenAccount.token,
      );
      expect(result).toBe(`${mockHtmlUrl}?${mockNotificationReferrer}`);
    });

    describe('Check Suite URLs', () => {
      it('successful workflow', async () => {
        const subject = {
          title: 'Demo workflow run succeeded for main branch',
          url: null,
          latest_comment_url: null,
          type: 'CheckSuite' as SubjectType,
        };

        const result = await generateGitHubWebUrl({
          ...mockSingleNotification,
          subject: subject,
        });

        expect(apiRequestAuthMock).toHaveBeenCalledTimes(0);
        expect(result).toBe(
          `https://github.com/gitify-app/notifications-test/actions?query=workflow%3A%22Demo%22+is%3Asuccess+branch%3Amain&${mockNotificationReferrer}`,
        );
      });

      it('failed workflow', async () => {
        const subject = {
          title: 'Demo workflow run failed for main branch',
          url: null,
          latest_comment_url: null,
          type: 'CheckSuite' as SubjectType,
        };

        const result = await generateGitHubWebUrl({
          ...mockSingleNotification,
          subject: subject,
        });

        expect(apiRequestAuthMock).toHaveBeenCalledTimes(0);
        expect(result).toBe(
          `https://github.com/gitify-app/notifications-test/actions?query=workflow%3A%22Demo%22+is%3Afailure+branch%3Amain&${mockNotificationReferrer}`,
        );
      });

      it('failed workflow multiple attempts', async () => {
        const subject = {
          title: 'Demo workflow run, Attempt #3 failed for main branch',
          url: null,
          latest_comment_url: null,
          type: 'CheckSuite' as SubjectType,
        };

        const result = await generateGitHubWebUrl({
          ...mockSingleNotification,
          subject: subject,
        });

        expect(apiRequestAuthMock).toHaveBeenCalledTimes(0);
        expect(result).toBe(
          `https://github.com/gitify-app/notifications-test/actions?query=workflow%3A%22Demo%22+is%3Afailure+branch%3Amain&${mockNotificationReferrer}`,
        );
      });

      it('skipped workflow', async () => {
        const subject = {
          title: 'Demo workflow run skipped for main branch',
          url: null,
          latest_comment_url: null,
          type: 'CheckSuite' as SubjectType,
        };

        const result = await generateGitHubWebUrl({
          ...mockSingleNotification,
          subject: subject,
        });

        expect(apiRequestAuthMock).toHaveBeenCalledTimes(0);
        expect(result).toBe(
          `https://github.com/gitify-app/notifications-test/actions?query=workflow%3A%22Demo%22+is%3Askipped+branch%3Amain&${mockNotificationReferrer}`,
        );
      });

      it('unhandled workflow scenario', async () => {
        const subject = {
          title: 'unhandled workflow scenario',
          url: null,
          latest_comment_url: null,
          type: 'CheckSuite' as SubjectType,
        };

        const result = await generateGitHubWebUrl({
          ...mockSingleNotification,
          subject: subject,
        });

        expect(apiRequestAuthMock).toHaveBeenCalledTimes(0);
        expect(result).toBe(
          `https://github.com/gitify-app/notifications-test/actions?${mockNotificationReferrer}`,
        );
      });

      it('unhandled status scenario', async () => {
        const subject = {
          title: 'Demo workflow run unhandled-status for main branch',
          url: null,
          latest_comment_url: null,
          type: 'CheckSuite' as SubjectType,
        };

        const result = await generateGitHubWebUrl({
          ...mockSingleNotification,
          subject: subject,
        });

        expect(apiRequestAuthMock).toHaveBeenCalledTimes(0);
        expect(result).toBe(
          `https://github.com/gitify-app/notifications-test/actions?query=workflow%3A%22Demo%22+branch%3Amain&${mockNotificationReferrer}`,
        );
      });

      it('unhandled check suite scenario', async () => {
        const subject = {
          title: 'Unhandled scenario',
          url: null,
          latest_comment_url: null,
          type: 'CheckSuite' as SubjectType,
        };

        const result = await generateGitHubWebUrl({
          ...mockSingleNotification,
          subject: subject,
        });

        expect(apiRequestAuthMock).toHaveBeenCalledTimes(0);
        expect(result).toBe(
          `https://github.com/gitify-app/notifications-test/actions?${mockNotificationReferrer}`,
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

        const result = await generateGitHubWebUrl({
          ...mockSingleNotification,
          subject: subject,
        });

        expect(apiRequestAuthMock).toHaveBeenCalledTimes(1);
        expect(result).toBe(
          `${mockSingleNotification.repository.html_url}/discussions?${mockNotificationReferrer}`,
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
              ...mockGraphQLResponse,
            },
          } as AxiosResponse),
        ) as AxiosPromise;

        apiRequestAuthMock.mockResolvedValue(requestPromise);

        const result = await generateGitHubWebUrl({
          ...mockSingleNotification,
          subject: subject,
        });

        expect(apiRequestAuthMock).toHaveBeenCalledTimes(1);
        expect(result).toBe(
          `https://github.com/gitify-app/notifications-test/discussions/612?${mockNotificationReferrer}#discussioncomment-2300902`,
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

        const result = await generateGitHubWebUrl({
          ...mockSingleNotification,
          subject: subject,
        });

        expect(apiRequestAuthMock).toHaveBeenCalledTimes(1);
        expect(result).toBe(
          `https://github.com/gitify-app/notifications-test/discussions?${mockNotificationReferrer}`,
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

      const result = await generateGitHubWebUrl({
        ...mockSingleNotification,
        subject: subject,
      });

      expect(apiRequestAuthMock).toHaveBeenCalledTimes(0);
      expect(result).toBe(
        `https://github.com/gitify-app/notifications-test/invitations?${mockNotificationReferrer}`,
      );
    });

    it('Repository Dependabot Alerts Thread url', async () => {
      const subject = {
        title: 'Your repository has dependencies with security vulnerabilities',
        url: null,
        latest_comment_url: null,
        type: 'RepositoryDependabotAlertsThread' as SubjectType,
      };

      const result = await generateGitHubWebUrl({
        ...mockSingleNotification,
        subject: subject,
      });

      expect(apiRequestAuthMock).toHaveBeenCalledTimes(0);
      expect(result).toBe(
        `https://github.com/gitify-app/notifications-test/security/dependabot?${mockNotificationReferrer}`,
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

        const result = await generateGitHubWebUrl({
          ...mockSingleNotification,
          subject: subject,
        });

        expect(apiRequestAuthMock).toHaveBeenCalledTimes(0);
        expect(result).toBe(
          `https://github.com/gitify-app/notifications-test/actions?query=is%3Awaiting&${mockNotificationReferrer}`,
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

        const result = await generateGitHubWebUrl({
          ...mockSingleNotification,
          subject: subject,
        });

        expect(apiRequestAuthMock).toHaveBeenCalledTimes(0);
        expect(result).toBe(
          `https://github.com/gitify-app/notifications-test/actions?${mockNotificationReferrer}`,
        );
      });

      it('unhandled workflow scenario', async () => {
        const subject = {
          title: 'some unhandled scenario',
          url: null,
          latest_comment_url: null,
          type: 'WorkflowRun' as SubjectType,
        };

        const result = await generateGitHubWebUrl({
          ...mockSingleNotification,
          subject: subject,
        });

        expect(apiRequestAuthMock).toHaveBeenCalledTimes(0);
        expect(result).toBe(
          `https://github.com/gitify-app/notifications-test/actions?${mockNotificationReferrer}`,
        );
      });
    });

    describe('defaults to repository url', () => {
      it('defaults when no urls present in notification', async () => {
        const subject = {
          title: 'generate github web url unit tests',
          url: null,
          latest_comment_url: null,
          type: 'Issue' as SubjectType,
        };

        const result = await generateGitHubWebUrl({
          ...mockSingleNotification,
          subject: subject,
        });

        expect(apiRequestAuthMock).toHaveBeenCalledTimes(0);
        expect(result).toBe(
          `${mockSingleNotification.repository.html_url}?${mockNotificationReferrer}`,
        );
      });

      it('defaults when exception handled during specialized html enrichment process', async () => {
        const logErrorSpy = jest.spyOn(logger, 'logError').mockImplementation();

        const subject = {
          title: 'generate github web url unit tests',
          url: 'https://api.github.com/repos/gitify-app/notifications-test/issues/1' as Link,
          latest_comment_url:
            'https://api.github.com/repos/gitify-app/notifications-test/issues/comments/302888448' as Link,
          type: 'Issue' as SubjectType,
        };

        const mockError = new Error('Test error');

        apiRequestAuthMock.mockRejectedValue(mockError);

        const result = await generateGitHubWebUrl({
          ...mockSingleNotification,
          subject: subject,
        });

        expect(apiRequestAuthMock).toHaveBeenCalledTimes(1);
        expect(apiRequestAuthMock).toHaveBeenCalledWith(
          subject.latest_comment_url,
          'GET',
          mockPersonalAccessTokenAccount.token,
        );
        expect(result).toBe(
          `https://github.com/gitify-app/notifications-test?${mockNotificationReferrer}`,
        );
        expect(logErrorSpy).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('formatting', () => {
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

  describe('getChevronDetails', () => {
    it('should return correct chevron details', () => {
      expect(getChevronDetails(true, true, 'account')).toEqual({
        icon: ChevronDownIcon,
        label: 'Hide account notifications',
      });

      expect(getChevronDetails(true, false, 'account')).toEqual({
        icon: ChevronRightIcon,
        label: 'Show account notifications',
      });

      expect(getChevronDetails(false, false, 'account')).toEqual({
        icon: ChevronLeftIcon,
        label: 'No notifications for account',
      });
    });
  });
});
