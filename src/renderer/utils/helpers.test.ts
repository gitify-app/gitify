import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@primer/octicons-react';

import { mockGitifyNotification } from '../__mocks__/notifications-mocks';
import { mockToken } from '../__mocks__/state-mocks';

import type { GitifySubject, Hostname, Link, SubjectType } from '../types';

import * as apiClient from './api/client';
import {
  generateGitHubWebUrl,
  generateNotificationReferrerId,
  getChevronDetails,
  getPlatformFromHostname,
  isEnterpriseServerHost,
  parseInlineCode,
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
      const referrerId = generateNotificationReferrerId(mockGitifyNotification);
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
        latestCommentUrl: mockLatestCommentUrl,
        type: 'Issue' as SubjectType,
        htmlUrl: mockSubjectHtmlUrl,
      } as GitifySubject;

      const result = await generateGitHubWebUrl({
        ...mockGitifyNotification,
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
        latestCommentUrl: mockLatestCommentUrl,
        type: 'Issue' as SubjectType,
        htmlUrl: mockSubjectHtmlUrl,
      } as GitifySubject;

      getHtmlUrlSpy.mockResolvedValue(mockHtmlUrl);

      const result = await generateGitHubWebUrl({
        ...mockGitifyNotification,
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
        latestCommentUrl: mockLatestCommentUrl,
        type: 'Issue' as SubjectType,
        htmlUrl: mockSubjectHtmlUrl,
      } as GitifySubject;

      getHtmlUrlSpy.mockResolvedValue(mockHtmlUrl);

      const result = await generateGitHubWebUrl({
        ...mockGitifyNotification,
        subject: subject,
      });

      expect(getHtmlUrlSpy).toHaveBeenCalledTimes(1);
      expect(getHtmlUrlSpy).toHaveBeenCalledWith(mockSubjectUrl, mockToken);
      expect(result).toBe(`${mockHtmlUrl}?${mockNotificationReferrer}`);
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

  describe('parseInlineCode', () => {
    it('should return plain text when no code blocks present', () => {
      expect(parseInlineCode('Simple notification title')).toEqual([
        {
          type: 'text',
          content: 'Simple notification title',
        },
      ]);
    });

    it('should parse single inline code block', () => {
      expect(
        parseInlineCode('refactor: migrate deprecated atlaskit `xcss`'),
      ).toEqual([
        {
          type: 'text',
          content: 'refactor: migrate deprecated atlaskit ',
        },
        {
          type: 'code',
          content: 'xcss',
        },
      ]);
    });

    it('should parse multiple inline code blocks', () => {
      expect(parseInlineCode('Replace `foo` with `bar` in config')).toEqual([
        {
          type: 'text',
          content: 'Replace ',
        },
        {
          type: 'code',
          content: 'foo',
        },
        {
          type: 'text',
          content: ' with ',
        },
        {
          type: 'code',
          content: 'bar',
        },
        {
          type: 'text',
          content: ' in config',
        },
      ]);
    });

    it('should parse code block at the start', () => {
      expect(parseInlineCode('`useState` hook implementation')).toEqual([
        {
          type: 'code',
          content: 'useState',
        },
        {
          type: 'text',
          content: ' hook implementation',
        },
      ]);
    });

    it('should parse code block at the end', () => {
      expect(parseInlineCode('Fix issue with `render`')).toEqual([
        {
          type: 'text',
          content: 'Fix issue with ',
        },
        {
          type: 'code',
          content: 'render',
        },
      ]);
    });

    it('should handle empty string', () => {
      expect(parseInlineCode('')).toEqual([
        {
          type: 'text',
          content: '',
        },
      ]);
    });

    it('should handle adjacent code blocks', () => {
      expect(parseInlineCode('Compare `foo``bar`')).toEqual([
        {
          type: 'text',
          content: 'Compare ',
        },
        {
          type: 'code',
          content: 'foo',
        },
        {
          type: 'code',
          content: 'bar',
        },
      ]);
    });
  });
});
