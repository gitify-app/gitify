import {
  generateGitHubAPIUrl,
  generateNotificationReferrerId,
  isEnterpriseHost,
  addHours,
  formatSearchQueryString,
  addNotificationReferrerIdToUrl,
  getHtmlUrl,
  generateGitHubWebUrl,
} from './helpers';
import {
  mockedGraphQLResponse,
  mockedSingleNotification,
  mockedUser,
} from '../__mocks__/mockedData';
import * as apiRequests from './api-requests';
import { AxiosPromise, AxiosResponse } from 'axios';
import { mockAccounts } from '../__mocks__/mock-state';
import { SubjectType } from '../typesGithub';

describe('utils/helpers.ts', () => {
  describe('isEnterpriseHost', () => {
    it('should return true for enterprise host', () => {
      expect(isEnterpriseHost('github.manos.im')).toBe(true);
      expect(isEnterpriseHost('api.github.manos.im')).toBe(true);
    });

    it('should return false for non-enterprise host', () => {
      expect(isEnterpriseHost('github.com')).toBe(false);
      expect(isEnterpriseHost('api.github.com')).toBe(false);
    });
  });

  describe('addNotificationReferrerIdToUrl', () => {
    it('should add notification_referrer_id to the URL', () => {
      // Mock data
      const url = 'https://github.com/some/repo';
      const notificationId = '123';
      const userId = 456;

      const result = addNotificationReferrerIdToUrl(
        url,
        notificationId,
        userId,
      );

      expect(result).toEqual(
        'https://github.com/some/repo?notification_referrer_id=MDE4Ok5vdGlmaWNhdGlvblRocmVhZDEyMzo0NTY%3D',
      );
    });

    it('should add notification_referrer_id to the URL, preserving anchor tags', () => {
      // Mock data
      const url =
        'https://github.com/some/repo/pull/123#issuecomment-1951055051';
      const notificationId = '123';
      const userId = 456;

      const result = addNotificationReferrerIdToUrl(
        url,
        notificationId,
        userId,
      );

      expect(result).toEqual(
        'https://github.com/some/repo/pull/123?notification_referrer_id=MDE4Ok5vdGlmaWNhdGlvblRocmVhZDEyMzo0NTY%3D#issuecomment-1951055051',
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
      const result = generateGitHubAPIUrl('github.com');
      expect(result).toBe('https://api.github.com/');
    });

    it('should generate a GitHub API url - enterprise', () => {
      const result = generateGitHubAPIUrl('github.manos.im');
      expect(result).toBe('https://github.manos.im/api/v3/');
    });
  });

  describe('addHours', () => {
    // Example test using Jest
    test('adds hours correctly for positive values', () => {
      const result = addHours('2024-02-20T12:00:00.000Z', 3);
      expect(result).toBe('2024-02-20T15:00:00.000Z');
    });

    test('adds hours correctly for negative values', () => {
      const result = addHours('2024-02-20T12:00:00.000Z', -2);
      expect(result).toBe('2024-02-20T10:00:00.000Z');
    });
  });

  describe('formatSearchQueryString', () => {
    test('formats search query string correctly', () => {
      const result = formatSearchQueryString(
        'exampleRepo',
        'exampleTitle',
        '2024-02-20T12:00:00.000Z',
      );

      expect(result).toBe(
        `exampleTitle in:title repo:exampleRepo updated:>2024-02-20T10:00:00.000Z`,
      );
    });
  });

  describe('getHtmlUrl', () => {
    let apiRequestAuthMock;

    beforeEach(() => {
      apiRequestAuthMock = jest.spyOn(apiRequests, 'apiRequestAuth');
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return the HTML URL', async () => {
      const requestPromise = new Promise((resolve) =>
        resolve({
          data: {
            html_url: 'https://github.com/gitify-app/gitify/issues/785',
          },
        } as AxiosResponse),
      ) as AxiosPromise;

      apiRequestAuthMock.mockResolvedValue(requestPromise);

      const result = await getHtmlUrl(
        'https://api.github.com/repos/gitify-app/gitify/issues/785',
        '123',
      );
      expect(result).toBe('https://github.com/gitify-app/gitify/issues/785');
    });
  });

  describe('generateGitHubWebUrl', () => {
    const mockedHtmlUrl = 'https://github.com/gitify-app/gitify/issues/785';
    const mockedNotificationReferrer =
      '?notification_referrer_id=MDE4Ok5vdGlmaWNhdGlvblRocmVhZDEzODY2MTA5NjoxMjM0NTY3ODk%3D';
    const apiRequestAuthMock = jest.spyOn(apiRequests, 'apiRequestAuth');

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('Subject Latest Comment Url: when not null, fetch lastest comment html url', async () => {
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
      expect(result).toBe(`${mockedHtmlUrl}${mockedNotificationReferrer}`);
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
      expect(result).toBe(`${mockedHtmlUrl}${mockedNotificationReferrer}`);
    });

    it('Discussions: when no subject urls and no discussions found via query, default to linking to repository discussions', async () => {
      const subject = {
        title: 'generate github web url unit tests',
        url: null,
        latest_comment_url: null,
        type: 'Discussion' as SubjectType,
      };

      const requestPromise = new Promise((resolve) =>
        resolve({
          data: {},
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
        `${mockedSingleNotification.repository.html_url}/discussions${mockedNotificationReferrer}`,
      );
    });

    it('Discussions: when no subject urls and no discussions found via query, default to linking to repository discussions', async () => {
      const subject = {
        title: '1.16.0',
        url: null,
        latest_comment_url: null,
        type: 'Discussion' as SubjectType,
      };

      // const latestDiscussionCommentId = 12345;

      const requestPromise = new Promise((resolve) =>
        resolve(mockedGraphQLResponse as AxiosResponse),
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
        'https://github.com/manosim/notifications-test/discussions/612?notification_referrer_id=MDE4Ok5vdGlmaWNhdGlvblRocmVhZDEzODY2MTA5NjoxMjM0NTY3ODk%3D#discussioncomment-2300902',
      );
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
        `${mockedSingleNotification.repository.html_url}${mockedNotificationReferrer}`,
      );
    });
  });
});
