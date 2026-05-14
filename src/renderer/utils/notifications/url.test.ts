import { mockGitHubCloudAccount } from '../../__mocks__/account-mocks';
import { mockGitifyNotification } from '../../__mocks__/notifications-mocks';

import type { GitifySubject, Link, SubjectType } from '../../types';

import { githubAdapter } from '../forges/github/adapter';
import { generateNotificationReferrerId, generateNotificationWebUrl } from './url';

describe('renderer/utils/notifications/url.ts', () => {
  describe('generateNotificationReferrerId', () => {
    it('should generate the notification_referrer_id', () => {
      const referrerId = generateNotificationReferrerId(mockGitifyNotification);
      expect(referrerId).toBe('MDE4Ok5vdGlmaWNhdGlvblRocmVhZDEzODY2MTA5NjoxMjM0NTY3ODk=');
    });
  });

  describe('generateNotificationWebUrl', () => {
    const mockHtmlUrl = 'https://github.com/gitify-app/notifications-test/issues/785' as Link;
    const mockNotificationReferrer =
      'notification_referrer_id=MDE4Ok5vdGlmaWNhdGlvblRocmVhZDEzODY2MTA5NjoxMjM0NTY3ODk%3D';

    const followUrlSpy = vi.spyOn(githubAdapter, 'followUrl');

    it('Subject HTML URL: prefer if available from enrichment stage', async () => {
      const mockSubjectHtmlUrl = 'https://gitify.io/' as Link;
      const mockSubjectUrl =
        'https://api.github.com/repos/gitify-app/notifications-test/issues/1' as Link;
      const mockLatestCommentUrl =
        'https://api.github.com/repos/gitify-app/notifications-test/issues/comments/302888448' as Link;

      const subject = {
        title: 'generate github web url unit tests',
        url: mockSubjectUrl,
        latestCommentUrl: mockLatestCommentUrl,
        type: 'Issue' as SubjectType,
        htmlUrl: mockSubjectHtmlUrl,
      } as unknown as GitifySubject;

      const result = await generateNotificationWebUrl({
        ...mockGitifyNotification,
        subject: subject,
      });

      expect(followUrlSpy).toHaveBeenCalledTimes(0);
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
        latestCommentUrl: mockLatestCommentUrl,
        type: 'Issue' as SubjectType,
        htmlUrl: mockSubjectHtmlUrl,
      } as unknown as GitifySubject;

      followUrlSpy.mockResolvedValue({ html_url: mockHtmlUrl });

      const result = await generateNotificationWebUrl({
        ...mockGitifyNotification,
        subject: subject,
      });

      expect(followUrlSpy).toHaveBeenCalledTimes(1);
      expect(followUrlSpy).toHaveBeenCalledWith(mockGitHubCloudAccount, mockLatestCommentUrl);
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
        latestCommentUrl: mockLatestCommentUrl,
        type: 'Issue' as SubjectType,
        htmlUrl: mockSubjectHtmlUrl,
      } as unknown as GitifySubject;

      followUrlSpy.mockResolvedValue({ html_url: mockHtmlUrl });

      const result = await generateNotificationWebUrl({
        ...mockGitifyNotification,
        subject: subject,
      });

      expect(followUrlSpy).toHaveBeenCalledTimes(1);
      expect(followUrlSpy).toHaveBeenCalledWith(mockGitHubCloudAccount, mockSubjectUrl);
      expect(result).toBe(`${mockHtmlUrl}?${mockNotificationReferrer}`);
    });
  });
});
