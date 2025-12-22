import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@primer/octicons-react';

import { mockToken } from '../__mocks__/state-mocks';
import type { Hostname, Link } from '../types';
import type { Subject, SubjectType } from '../typesGitHub';
import { mockSingleNotification } from './api/__mocks__/response-mocks';
import * as apiClient from './api/client';
import {
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

    const getHtmlUrlSpy = jest.spyOn(apiClient, 'getHtmlUrl');

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('Subject HTML URL: prefer if available from enrichment stage', async () => {
      const mockSubjectHtmlUrl = 'https://gitify.io/' as Link;
      const mockSubjectUrl =
        'https://api.github.com/repos/gitify-app/notifications-test/issues/1' as Link;
      const mockLatestCommentUrl =
        'https://api.github.com/repos/gitify-app/notifications-test/issues/comments/302888448' as Link;

      const subject = {
        title: 'generate github web url unit tests',
        url: mockSubjectUrl,
        latest_comment_url: mockLatestCommentUrl,
        type: 'Issue' as SubjectType,
        htmlUrl: mockSubjectHtmlUrl,
      } as Subject;

      const result = await generateGitHubWebUrl({
        ...mockSingleNotification,
        subject: subject,
      });

      expect(getHtmlUrlSpy).toHaveBeenCalledTimes(0);
      expect(result).toBe(`${mockSubjectHtmlUrl}?${mockNotificationReferrer}`);
    });

    it('Subject Latest Comment Url: when not null, fetch latest comment html url', async () => {
      const mockSubjectHtmlUrl = null;
      const mockSubjectUrl =
        'https://api.github.com/repos/gitify-app/notifications-test/issues/1' as Link;
      const mockLatestCommentUrl =
        'https://api.github.com/repos/gitify-app/notifications-test/issues/comments/302888448' as Link;

      const subject = {
        title: 'generate github web url unit tests',
        url: mockSubjectUrl,
        latest_comment_url: mockLatestCommentUrl,
        type: 'Issue' as SubjectType,
        htmlUrl: mockSubjectHtmlUrl,
      } as Subject;

      getHtmlUrlSpy.mockResolvedValue(mockHtmlUrl);

      const result = await generateGitHubWebUrl({
        ...mockSingleNotification,
        subject: subject,
      });

      expect(getHtmlUrlSpy).toHaveBeenCalledTimes(1);
      expect(getHtmlUrlSpy).toHaveBeenCalledWith(
        mockLatestCommentUrl,
        mockToken,
      );
      expect(result).toBe(`${mockHtmlUrl}?${mockNotificationReferrer}`);
    });

    it('Subject Url: when no latest comment url available, fetch subject html url', async () => {
      const mockSubjectHtmlUrl = null;
      const mockSubjectUrl =
        'https://api.github.com/repos/gitify-app/notifications-test/issues/1' as Link;
      const mockLatestCommentUrl = null;

      const subject = {
        title: 'generate github web url unit tests',
        url: mockSubjectUrl,
        latest_comment_url: mockLatestCommentUrl,
        type: 'Issue' as SubjectType,
        htmlUrl: mockSubjectHtmlUrl,
      } as Subject;

      getHtmlUrlSpy.mockResolvedValue(mockHtmlUrl);

      const result = await generateGitHubWebUrl({
        ...mockSingleNotification,
        subject: subject,
      });

      expect(getHtmlUrlSpy).toHaveBeenCalledTimes(1);
      expect(getHtmlUrlSpy).toHaveBeenCalledWith(mockSubjectUrl, mockToken);
      expect(result).toBe(`${mockHtmlUrl}?${mockNotificationReferrer}`);
    });

    // describe('Check Suite URLs', () => {
    //   it('successful workflow', async () => {
    //     const subject = {
    //       title: 'Demo workflow run succeeded for main branch',
    //       url: null,
    //       latest_comment_url: null,
    //       type: 'CheckSuite' as SubjectType,
    //     } as Subject;

    //     const result = await generateGitHubWebUrl({
    //       ...mockSingleNotification,
    //       subject: subject,
    //     });

    //     expect(getHtmlUrlSpy).toHaveBeenCalledTimes(0);
    //     expect(result).toBe(
    //       `https://github.com/gitify-app/notifications-test/actions?query=workflow%3A%22Demo%22+is%3ASUCCESS+branch%3Amain&${mockNotificationReferrer}`,
    //     );
    //   });

    //   it('failed workflow', async () => {
    //     const subject = {
    //       title: 'Demo workflow run failed for main branch',
    //       url: null,
    //       latest_comment_url: null,
    //       type: 'CheckSuite' as SubjectType,
    //     } as Subject;

    //     const result = await generateGitHubWebUrl({
    //       ...mockSingleNotification,
    //       subject: subject,
    //     });

    //     expect(getHtmlUrlSpy).toHaveBeenCalledTimes(0);
    //     expect(result).toBe(
    //       `https://github.com/gitify-app/notifications-test/actions?query=workflow%3A%22Demo%22+is%3AFAILURE+branch%3Amain&${mockNotificationReferrer}`,
    //     );
    //   });

    //   it('failed workflow multiple attempts', async () => {
    //     const subject = {
    //       title: 'Demo workflow run, Attempt #3 failed for main branch',
    //       url: null,
    //       latest_comment_url: null,
    //       type: 'CheckSuite' as SubjectType,
    //     } as Subject;

    //     const result = await generateGitHubWebUrl({
    //       ...mockSingleNotification,
    //       subject: subject,
    //     });

    //     expect(getHtmlUrlSpy).toHaveBeenCalledTimes(0);
    //     expect(result).toBe(
    //       `https://github.com/gitify-app/notifications-test/actions?query=workflow%3A%22Demo%22+is%3AFAILURE+branch%3Amain&${mockNotificationReferrer}`,
    //     );
    //   });

    //   it('skipped workflow', async () => {
    //     const subject = {
    //       title: 'Demo workflow run skipped for main branch',
    //       url: null,
    //       latest_comment_url: null,
    //       type: 'CheckSuite' as SubjectType,
    //     } as Subject;

    //     const result = await generateGitHubWebUrl({
    //       ...mockSingleNotification,
    //       subject: subject,
    //     });

    //     expect(getHtmlUrlSpy).toHaveBeenCalledTimes(0);
    //     expect(result).toBe(
    //       `https://github.com/gitify-app/notifications-test/actions?query=workflow%3A%22Demo%22+is%3ASKIPPED+branch%3Amain&${mockNotificationReferrer}`,
    //     );
    //   });

    //   it('unhandled workflow scenario', async () => {
    //     const subject = {
    //       title: 'unhandled workflow scenario',
    //       url: null,
    //       latest_comment_url: null,
    //       type: 'CheckSuite' as SubjectType,
    //     } as Subject;

    //     const result = await generateGitHubWebUrl({
    //       ...mockSingleNotification,
    //       subject: subject,
    //     });

    //     expect(getHtmlUrlSpy).toHaveBeenCalledTimes(0);
    //     expect(result).toBe(
    //       `https://github.com/gitify-app/notifications-test/actions?${mockNotificationReferrer}`,
    //     );
    //   });

    //   it('unhandled status scenario', async () => {
    //     const subject = {
    //       title: 'Demo workflow run unhandled-status for main branch',
    //       url: null,
    //       latest_comment_url: null,
    //       type: 'CheckSuite' as SubjectType,
    //     } as Subject;

    //     const result = await generateGitHubWebUrl({
    //       ...mockSingleNotification,
    //       subject: subject,
    //     });

    //     expect(getHtmlUrlSpy).toHaveBeenCalledTimes(0);
    //     expect(result).toBe(
    //       `https://github.com/gitify-app/notifications-test/actions?query=workflow%3A%22Demo%22+branch%3Amain&${mockNotificationReferrer}`,
    //     );
    //   });

    //   it('unhandled check suite scenario', async () => {
    //     const subject = {
    //       title: 'Unhandled scenario',
    //       url: null,
    //       latest_comment_url: null,
    //       type: 'CheckSuite' as SubjectType,
    //     } as Subject;

    //     const result = await generateGitHubWebUrl({
    //       ...mockSingleNotification,
    //       subject: subject,
    //     });

    //     expect(getHtmlUrlSpy).toHaveBeenCalledTimes(0);
    //     expect(result).toBe(
    //       `https://github.com/gitify-app/notifications-test/actions?${mockNotificationReferrer}`,
    //     );
    //   });
    // });

    // describe('Discussions URLs', () => {
    //   const fetchDiscussionByNumberSpy = jest.spyOn(
    //     apiClient,
    //     'fetchDiscussionByNumber',
    //   );

    //   it('when no discussion found via graphql api, default to base repository discussion url', async () => {
    //     const subject = {
    //       title: 'generate github web url unit tests',
    //       url: null,
    //       latest_comment_url: null,
    //       type: 'Discussion' as SubjectType,
    //     } as Subject;

    //     fetchDiscussionByNumberSpy.mockResolvedValue({
    //       data: { repository: { discussion: null } },
    //     } as any);

    //     const result = await generateGitHubWebUrl({
    //       ...mockSingleNotification,
    //       subject: subject,
    //     });

    //     expect(fetchDiscussionByNumberSpy).toHaveBeenCalledTimes(1);
    //     expect(result).toBe(
    //       `${mockSingleNotification.repository.html_url}/discussions?${mockNotificationReferrer}`,
    //     );
    //   });

    //   it('when error fetching discussion via graphql api, default to base repository discussion url', async () => {
    //     const rendererLogErrorSpy = jest
    //       .spyOn(logger, 'rendererLogError')
    //       .mockImplementation();

    //     const subject = {
    //       title: '1.16.0',
    //       url: null,
    //       latest_comment_url: null,
    //       type: 'Discussion' as SubjectType,
    //     } as Subject;

    //     fetchDiscussionByNumberSpy.mockResolvedValue({
    //       data: null,
    //       errors: [
    //         {
    //           message: 'Something failed',
    //         },
    //       ],
    //     } as unknown as ExecutionResult<FetchDiscussionByNumberQuery>);

    //     const result = await generateGitHubWebUrl({
    //       ...mockSingleNotification,
    //       subject: subject,
    //     });

    //     expect(fetchDiscussionByNumberSpy).toHaveBeenCalledTimes(1);
    //     expect(result).toBe(
    //       `https://github.com/gitify-app/notifications-test/discussions?${mockNotificationReferrer}`,
    //     );
    //     expect(rendererLogErrorSpy).toHaveBeenCalledTimes(1);
    //   });

    //   it('when discussion found via graphql api, link to matching discussion and comment hash', async () => {
    //     const subject = {
    //       title: '1.16.0',
    //       url: null,
    //       latest_comment_url: null,
    //       type: 'Discussion' as SubjectType,
    //     } as Subject;

    //     fetchDiscussionByNumberSpy.mockResolvedValue({
    //       data: mockDiscussionByNumberGraphQLResponse,
    //     } as ExecutionResult<FetchDiscussionByNumberQuery>);

    //     const result = await generateGitHubWebUrl({
    //       ...mockSingleNotification,
    //       subject: subject,
    //     });

    //     expect(fetchDiscussionByNumberSpy).toHaveBeenCalledTimes(1);
    //     expect(result).toBe(
    //       `https://github.com/gitify-app/notifications-test/discussions/612?${mockNotificationReferrer}#discussioncomment-2300902`,
    //     );
    //   });

    //   it('when api throws error, default to base repository discussion url', async () => {
    //     const rendererLogErrorSpy = jest
    //       .spyOn(logger, 'rendererLogError')
    //       .mockImplementation();

    //     const subject = {
    //       title: '1.16.0',
    //       url: null,
    //       latest_comment_url: null,
    //       type: 'Discussion' as SubjectType,
    //     } as Subject;

    //     fetchDiscussionByNumberSpy.mockRejectedValue(
    //       new Error('Something failed'),
    //     );

    //     const result = await generateGitHubWebUrl({
    //       ...mockSingleNotification,
    //       subject: subject,
    //     });

    //     expect(fetchDiscussionByNumberSpy).toHaveBeenCalledTimes(1);
    //     expect(result).toBe(
    //       `https://github.com/gitify-app/notifications-test/discussions?${mockNotificationReferrer}`,
    //     );
    //     expect(rendererLogErrorSpy).toHaveBeenCalledTimes(1);
    //   });
    // });

    // it('Repository Invitation url', async () => {
    //   const subject = {
    //     title:
    //       'Invitation to join gitify-app/notifications-test from unit-tests',
    //     url: null,
    //     latest_comment_url: null,
    //     type: 'RepositoryInvitation' as SubjectType,
    //   } as Subject;

    //   const result = await generateGitHubWebUrl({
    //     ...mockSingleNotification,
    //     subject: subject,
    //   });

    //   expect(getHtmlUrlSpy).toHaveBeenCalledTimes(0);
    //   expect(result).toBe(
    //     `https://github.com/gitify-app/notifications-test/invitations?${mockNotificationReferrer}`,
    //   );
    // });

    // it('Repository Dependabot Alerts Thread url', async () => {
    //   const subject = {
    //     title: 'Your repository has dependencies with security vulnerabilities',
    //     url: null,
    //     latest_comment_url: null,
    //     type: 'RepositoryDependabotAlertsThread' as SubjectType,
    //   };

    //   const result = await generateGitHubWebUrl({
    //     ...mockSingleNotification,
    //     subject: subject,
    //   });

    //   expect(getHtmlUrlSpy).toHaveBeenCalledTimes(0);
    //   expect(result).toBe(
    //     `https://github.com/gitify-app/notifications-test/security/dependabot?${mockNotificationReferrer}`,
    //   );
    // });

    // describe('Workflow Run URLs', () => {
    //   it('approval requested', async () => {
    //     const subject = {
    //       title: 'some-user requested your review to deploy to an environment',
    //       url: null,
    //       latest_comment_url: null,
    //       type: 'WorkflowRun' as SubjectType,
    //     } as Subject;

    //     const result = await generateGitHubWebUrl({
    //       ...mockSingleNotification,
    //       subject: subject,
    //     });

    //     expect(getHtmlUrlSpy).toHaveBeenCalledTimes(0);
    //     expect(result).toBe(
    //       `https://github.com/gitify-app/notifications-test/actions?query=is%3AWAITING&${mockNotificationReferrer}`,
    //     );
    //   });

    //   it('unhandled status/action scenario', async () => {
    //     const subject = {
    //       title:
    //         'some-user requested your unhandled-action to deploy to an environment',
    //       url: null,
    //       latest_comment_url: null,
    //       type: 'WorkflowRun' as SubjectType,
    //     } as Subject;

    //     const result = await generateGitHubWebUrl({
    //       ...mockSingleNotification,
    //       subject: subject,
    //     });

    //     expect(getHtmlUrlSpy).toHaveBeenCalledTimes(0);
    //     expect(result).toBe(
    //       `https://github.com/gitify-app/notifications-test/actions?${mockNotificationReferrer}`,
    //     );
    //   });

    //   it('unhandled workflow scenario', async () => {
    //     const subject = {
    //       title: 'some unhandled scenario',
    //       url: null,
    //       latest_comment_url: null,
    //       type: 'WorkflowRun' as SubjectType,
    //     } as Subject;

    //     const result = await generateGitHubWebUrl({
    //       ...mockSingleNotification,
    //       subject: subject,
    //     });

    //     expect(getHtmlUrlSpy).toHaveBeenCalledTimes(0);
    //     expect(result).toBe(
    //       `https://github.com/gitify-app/notifications-test/actions?${mockNotificationReferrer}`,
    //     );
    //   });
    // });

    // describe('defaults web urls', () => {
    //   it('issues - defaults when no urls present in notification', async () => {
    //     const subject = {
    //       title: 'generate github web url unit tests',
    //       url: null,
    //       latest_comment_url: null,
    //       type: 'Issue' as SubjectType,
    //     } as Subject;

    //     const result = await generateGitHubWebUrl({
    //       ...mockSingleNotification,
    //       subject: subject,
    //     });

    //     expect(getHtmlUrlSpy).toHaveBeenCalledTimes(0);
    //     expect(result).toBe(
    //       `https://github.com/gitify-app/notifications-test/issues?${mockNotificationReferrer}`,
    //     );
    //   });

    //   it('pull requests - defaults when no urls present in notification', async () => {
    //     const subject = {
    //       title: 'generate github web url unit tests',
    //       url: null,
    //       latest_comment_url: null,
    //       type: 'PullRequest' as SubjectType,
    //     } as Subject;

    //     const result = await generateGitHubWebUrl({
    //       ...mockSingleNotification,
    //       subject: subject,
    //     });

    //     expect(getHtmlUrlSpy).toHaveBeenCalledTimes(0);
    //     expect(result).toBe(
    //       `https://github.com/gitify-app/notifications-test/pulls?${mockNotificationReferrer}`,
    //     );
    //   });

    //   it('other - defaults when no urls present in notification', async () => {
    //     const subject = {
    //       title: 'generate github web url unit tests',
    //       url: null,
    //       latest_comment_url: null,
    //       type: 'Commit' as SubjectType,
    //     } as Subject;

    //     const result = await generateGitHubWebUrl({
    //       ...mockSingleNotification,
    //       subject: subject,
    //     });

    //     expect(getHtmlUrlSpy).toHaveBeenCalledTimes(0);
    //     expect(result).toBe(
    //       `https://github.com/gitify-app/notifications-test?${mockNotificationReferrer}`,
    //     );
    //   });

    //   it('defaults when exception handled during specialized html enrichment process', async () => {
    //     const rendererLogErrorSpy = jest
    //       .spyOn(logger, 'rendererLogError')
    //       .mockImplementation();

    //     const subject = {
    //       title: 'generate github web url unit tests',
    //       url: 'https://api.github.com/repos/gitify-app/notifications-test/issues/1' as Link,
    //       latest_comment_url: null as Link,
    //       type: 'Issue' as SubjectType,
    //     } as Subject;

    //     getHtmlUrlSpy.mockRejectedValue(new Error('Test error'));

    //     const result = await generateGitHubWebUrl({
    //       ...mockSingleNotification,
    //       subject: subject,
    //     });

    //     expect(getHtmlUrlSpy).toHaveBeenCalledTimes(1);
    //     expect(result).toBe(
    //       `https://github.com/gitify-app/notifications-test/issues?${mockNotificationReferrer}`,
    //     );
    //     expect(rendererLogErrorSpy).toHaveBeenCalledTimes(1);
    //   });
    // });
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
