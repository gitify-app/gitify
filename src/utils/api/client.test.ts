import axios, { type AxiosPromise, type AxiosResponse } from 'axios';
import {
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
  mockToken,
} from '../../__mocks__/state-mocks';
import type { SettingsState } from '../../types';
import type { Hostname, Token } from '../branded-types';
import {
  getAuthenticatedUser,
  getHtmlUrl,
  headNotifications,
  ignoreNotificationThreadSubscription,
  listNotificationsForAuthenticatedUser,
  markNotificationThreadAsDone,
  markNotificationThreadAsRead,
  markRepositoryNotificationsAsRead,
} from './client';
import * as apiRequests from './request';

jest.mock('axios');

const mockGitHubHostname = 'github.com' as Hostname;
const mockEnterpriseHostname = 'example.com' as Hostname;
const mockThreadId = '1234';
const mockRepoSlug = 'gitify-app/notifications-test';

describe('utils/api/client.ts', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getAuthenticatedUser', () => {
    it('should fetch authenticated user - github', async () => {
      await getAuthenticatedUser(mockGitHubHostname, mockToken);

      expect(axios).toHaveBeenCalledWith({
        url: 'https://api.github.com/user',
        method: 'GET',
        data: {},
      });

      expect(axios.defaults.headers.common).toMatchSnapshot();
    });

    it('should fetch authenticated user - enterprise', async () => {
      await getAuthenticatedUser(mockEnterpriseHostname, mockToken);

      expect(axios).toHaveBeenCalledWith({
        url: 'https://example.com/api/v3/user',
        method: 'GET',
        data: {},
      });

      expect(axios.defaults.headers.common).toMatchSnapshot();
    });
  });

  describe('headNotifications', () => {
    it('should fetch notifications head - github', async () => {
      await headNotifications(mockGitHubHostname, mockToken);

      expect(axios).toHaveBeenCalledWith({
        url: 'https://api.github.com/notifications',
        method: 'HEAD',
        data: {},
      });

      expect(axios.defaults.headers.common).toMatchSnapshot();
    });

    it('should fetch notifications head - enterprise', async () => {
      await headNotifications(mockEnterpriseHostname, mockToken);

      expect(axios).toHaveBeenCalledWith({
        url: 'https://example.com/api/v3/notifications',
        method: 'HEAD',
        data: {},
      });

      expect(axios.defaults.headers.common).toMatchSnapshot();
    });
  });

  describe('listNotificationsForAuthenticatedUser', () => {
    const mockSettings: Partial<SettingsState> = {
      participating: true,
    };

    it('should list notifications for user - github cloud', async () => {
      await listNotificationsForAuthenticatedUser(
        mockGitHubCloudAccount,
        mockSettings as SettingsState,
      );

      expect(axios).toHaveBeenCalledWith({
        url: 'https://api.github.com/notifications?participating=true',
        method: 'GET',
        data: {},
      });

      expect(axios.defaults.headers.common).toMatchSnapshot();
    });

    it('should list notifications for user - github enterprise server', async () => {
      await listNotificationsForAuthenticatedUser(
        mockGitHubEnterpriseServerAccount,
        mockSettings as SettingsState,
      );

      expect(axios).toHaveBeenCalledWith({
        url: 'https://github.gitify.io/api/v3/notifications?participating=true',
        method: 'GET',
        data: {},
      });

      expect(axios.defaults.headers.common).toMatchSnapshot();
    });
  });

  describe('markNotificationThreadAsRead', () => {
    it('should mark notification thread as read - github', async () => {
      await markNotificationThreadAsRead(
        mockThreadId,
        mockGitHubHostname,
        mockToken,
      );

      expect(axios).toHaveBeenCalledWith({
        url: `https://api.github.com/notifications/threads/${mockThreadId}`,
        method: 'PATCH',
        data: {},
      });

      expect(axios.defaults.headers.common).toMatchSnapshot();
    });

    it('should mark notification thread as read- enterprise', async () => {
      await markNotificationThreadAsRead(
        mockThreadId,
        mockEnterpriseHostname,
        mockToken,
      );

      expect(axios).toHaveBeenCalledWith({
        url: `https://example.com/api/v3/notifications/threads/${mockThreadId}`,
        method: 'PATCH',
        data: {},
      });

      expect(axios.defaults.headers.common).toMatchSnapshot();
    });
  });

  describe('markNotificationThreadAsDone', () => {
    it('should mark notification thread as done - github', async () => {
      await markNotificationThreadAsDone(
        mockThreadId,
        mockGitHubHostname,
        mockToken,
      );

      expect(axios).toHaveBeenCalledWith({
        url: `https://api.github.com/notifications/threads/${mockThreadId}`,
        method: 'DELETE',
        data: {},
      });

      expect(axios.defaults.headers.common).toMatchSnapshot();
    });

    it('should mark notification thread as done- enterprise', async () => {
      await markNotificationThreadAsDone(
        mockThreadId,
        mockEnterpriseHostname,
        mockToken,
      );

      expect(axios).toHaveBeenCalledWith({
        url: `https://example.com/api/v3/notifications/threads/${mockThreadId}`,
        method: 'DELETE',
        data: {},
      });

      expect(axios.defaults.headers.common).toMatchSnapshot();
    });
  });

  describe('ignoreNotificationThreadSubscription', () => {
    it('should ignore notification thread subscription - github', async () => {
      await ignoreNotificationThreadSubscription(
        mockThreadId,
        mockGitHubHostname,
        mockToken,
      );

      expect(axios).toHaveBeenCalledWith({
        url: `https://api.github.com/notifications/threads/${mockThreadId}/subscription`,
        method: 'PUT',
        data: { ignored: true },
      });

      expect(axios.defaults.headers.common).toMatchSnapshot();
    });

    it('should ignore notification thread subscription- enterprise', async () => {
      await ignoreNotificationThreadSubscription(
        mockThreadId,
        mockEnterpriseHostname,
        mockToken,
      );

      expect(axios).toHaveBeenCalledWith({
        url: `https://example.com/api/v3/notifications/threads/${mockThreadId}/subscription`,
        method: 'PUT',
        data: { ignored: true },
      });

      expect(axios.defaults.headers.common).toMatchSnapshot();
    });
  });

  describe('markRepositoryNotificationsAsRead', () => {
    it('should mark repository notifications as read - github', async () => {
      await markRepositoryNotificationsAsRead(
        mockRepoSlug,
        mockGitHubHostname,
        mockToken,
      );

      expect(axios).toHaveBeenCalledWith({
        url: `https://api.github.com/repos/${mockRepoSlug}/notifications`,
        method: 'PUT',
        data: {},
      });

      expect(axios.defaults.headers.common).toMatchSnapshot();
    });

    it('should mark repository notifications as read - enterprise', async () => {
      await markRepositoryNotificationsAsRead(
        mockRepoSlug,
        mockEnterpriseHostname,
        mockToken,
      );

      expect(axios).toHaveBeenCalledWith({
        url: `https://example.com/api/v3/repos/${mockRepoSlug}/notifications`,
        method: 'PUT',
        data: {},
      });

      expect(axios.defaults.headers.common).toMatchSnapshot();
    });
  });

  describe('getHtmlUrl', () => {
    it('should return the HTML URL', async () => {
      const apiRequestAuthMock = jest.spyOn(apiRequests, 'apiRequestAuth');

      const requestPromise = new Promise((resolve) =>
        resolve({
          data: {
            html_url:
              'https://github.com/gitify-app/notifications-test/issues/785',
          },
        } as AxiosResponse),
      ) as AxiosPromise;

      apiRequestAuthMock.mockResolvedValue(requestPromise);

      const result = await getHtmlUrl(
        'https://api.github.com/repos/gitify-app/notifications-test/issues/785',
        '123' as Token,
      );
      expect(result).toBe(
        'https://github.com/gitify-app/notifications-test/issues/785',
      );
    });

    it('should handle error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const apiRequestAuthMock = jest.spyOn(apiRequests, 'apiRequestAuth');

      const mockError = new Error('Test error');

      apiRequestAuthMock.mockRejectedValue(mockError);

      await getHtmlUrl(
        'https://api.github.com/repos/gitify-app/gitify/issues/785',
        '123' as Token,
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to get html url');
    });
  });
});
