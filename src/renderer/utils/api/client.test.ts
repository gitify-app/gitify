import axios, { type AxiosPromise, type AxiosResponse } from 'axios';

import {
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
  mockToken,
} from '../../__mocks__/state-mocks';
import type { Hostname, Link, SettingsState } from '../../types';
import * as logger from '../../utils/logger';
import {
  getAuthenticatedUser,
  getHtmlUrl,
  headNotifications,
  ignoreNotificationThreadSubscription,
  listNotificationsForAuthenticatedUser,
  markNotificationThreadAsDone,
  markNotificationThreadAsRead,
} from './client';
import * as apiRequests from './request';

jest.mock('axios');

const mockGitHubHostname = 'github.com' as Hostname;
const mockEnterpriseHostname = 'example.com' as Hostname;
const mockThreadId = '1234';

describe('renderer/utils/api/client.ts', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAuthenticatedUser', () => {
    it('should fetch authenticated user - github', async () => {
      await getAuthenticatedUser(mockGitHubHostname, mockToken);

      expect(axios).toHaveBeenCalledWith({
        url: 'https://api.github.com/user',
        headers: {
          Accept: 'application/json',
          Authorization: 'token decrypted',
          'Cache-Control': '',
          'Content-Type': 'application/json',
        },
        method: 'GET',
        data: {},
      });
    });

    it('should fetch authenticated user - enterprise', async () => {
      await getAuthenticatedUser(mockEnterpriseHostname, mockToken);

      expect(axios).toHaveBeenCalledWith({
        url: 'https://example.com/api/v3/user',
        headers: {
          Accept: 'application/json',
          Authorization: 'token decrypted',
          'Cache-Control': '',
          'Content-Type': 'application/json',
        },
        method: 'GET',
        data: {},
      });
    });
  });

  describe('headNotifications', () => {
    it('should fetch notifications head - github', async () => {
      await headNotifications(mockGitHubHostname, mockToken);

      expect(axios).toHaveBeenCalledWith({
        url: 'https://api.github.com/notifications',
        headers: {
          Accept: 'application/json',
          Authorization: 'token decrypted',
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
        },
        method: 'HEAD',
        data: {},
      });
    });

    it('should fetch notifications head - enterprise', async () => {
      await headNotifications(mockEnterpriseHostname, mockToken);

      expect(axios).toHaveBeenCalledWith({
        url: 'https://example.com/api/v3/notifications',
        headers: {
          Accept: 'application/json',
          Authorization: 'token decrypted',
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
        },
        method: 'HEAD',
        data: {},
      });
    });
  });

  describe('listNotificationsForAuthenticatedUser', () => {
    it('should list notifications for user - github cloud - fetchAllNotifications true', async () => {
      const mockSettings: Partial<SettingsState> = {
        participating: true,
        fetchAllNotifications: true,
      };

      await listNotificationsForAuthenticatedUser(
        mockGitHubCloudAccount,
        mockSettings as SettingsState,
      );

      expect(axios).toHaveBeenCalledWith({
        url: 'https://api.github.com/notifications?participating=true',
        headers: {
          Accept: 'application/json',
          Authorization: 'token decrypted',
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
        },
        method: 'GET',
        data: {},
      });
    });

    it('should list notifications for user - github cloud - fetchAllNotifications false', async () => {
      const mockSettings: Partial<SettingsState> = {
        participating: true,
        fetchAllNotifications: false,
      };

      await listNotificationsForAuthenticatedUser(
        mockGitHubCloudAccount,
        mockSettings as SettingsState,
      );

      expect(axios).toHaveBeenCalledWith({
        url: 'https://api.github.com/notifications?participating=true',
        headers: {
          Accept: 'application/json',
          Authorization: 'token decrypted',
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
        },
        method: 'GET',
        data: {},
      });
    });

    it('should list notifications for user - github enterprise server', async () => {
      const mockSettings: Partial<SettingsState> = {
        participating: true,
      };

      await listNotificationsForAuthenticatedUser(
        mockGitHubEnterpriseServerAccount,
        mockSettings as SettingsState,
      );

      expect(axios).toHaveBeenCalledWith({
        url: 'https://github.gitify.io/api/v3/notifications?participating=true',
        headers: {
          Accept: 'application/json',
          Authorization: 'token decrypted',
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
        },
        method: 'GET',
        data: {},
      });
    });
  });

  describe('markNotificationThreadAsRead', () => {
    it('should mark notification thread as read - github', async () => {
      await markNotificationThreadAsRead(mockGitHubCloudAccount, mockThreadId);

      expect(axios).toHaveBeenCalledWith({
        url: `https://api.github.com/notifications/threads/${mockThreadId}`,
        headers: {
          Accept: 'application/json',
          Authorization: 'token decrypted',
          'Cache-Control': '',
          'Content-Type': 'application/json',
        },
        method: 'PATCH',
        data: {},
      });
    });

    it('should mark notification thread as read - enterprise', async () => {
      await markNotificationThreadAsRead(
        mockGitHubEnterpriseServerAccount,
        mockThreadId,
      );

      expect(axios).toHaveBeenCalledWith({
        url: `https://github.gitify.io/api/v3/notifications/threads/${mockThreadId}`,
        headers: {
          Accept: 'application/json',
          Authorization: 'token decrypted',
          'Cache-Control': '',
          'Content-Type': 'application/json',
        },
        method: 'PATCH',
        data: {},
      });
    });
  });

  describe('markNotificationThreadAsDone', () => {
    it('should mark notification thread as done - github', async () => {
      await markNotificationThreadAsDone(mockGitHubCloudAccount, mockThreadId);

      expect(axios).toHaveBeenCalledWith({
        url: `https://api.github.com/notifications/threads/${mockThreadId}`,
        headers: {
          Accept: 'application/json',
          Authorization: 'token decrypted',
          'Cache-Control': '',
          'Content-Type': 'application/json',
        },
        method: 'DELETE',
        data: {},
      });
    });

    it('should mark notification thread as done - enterprise', async () => {
      await markNotificationThreadAsDone(
        mockGitHubEnterpriseServerAccount,
        mockThreadId,
      );

      expect(axios).toHaveBeenCalledWith({
        url: `https://example.com/api/v3/notifications/threads/${mockThreadId}`,
        headers: {
          Accept: 'application/json',
          Authorization: 'token decrypted',
          'Cache-Control': '',
          'Content-Type': 'application/json',
        },
        method: 'DELETE',
        data: {},
      });
    });
  });

  describe('ignoreNotificationThreadSubscription', () => {
    it('should ignore notification thread subscription - github', async () => {
      await ignoreNotificationThreadSubscription(
        mockGitHubCloudAccount,
        mockThreadId,
      );

      expect(axios).toHaveBeenCalledWith({
        url: `https://api.github.com/notifications/threads/${mockThreadId}/subscription`,
        headers: {
          Accept: 'application/json',
          Authorization: 'token decrypted',
          'Cache-Control': '',
          'Content-Type': 'application/json',
        },
        method: 'PUT',
        data: { ignored: true },
      });
    });

    it('should ignore notification thread subscription - enterprise', async () => {
      await ignoreNotificationThreadSubscription(
        mockGitHubEnterpriseServerAccount,
        mockThreadId,
      );

      expect(axios).toHaveBeenCalledWith({
        url: `https://github.gitify.io/api/v3/notifications/threads/${mockThreadId}/subscription`,
        headers: {
          Accept: 'application/json',
          Authorization: 'token decrypted',
          'Cache-Control': '',
          'Content-Type': 'application/json',
        },
        method: 'PUT',
        data: { ignored: true },
      });
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
        mockGitHubCloudAccount,
        'https://api.github.com/repos/gitify-app/notifications-test/issues/785' as Link,
      );
      expect(result).toBe(
        'https://github.com/gitify-app/notifications-test/issues/785',
      );
    });

    it('should handle error', async () => {
      const rendererLogErrorSpy = jest
        .spyOn(logger, 'rendererLogError')
        .mockImplementation();

      const apiRequestAuthMock = jest.spyOn(apiRequests, 'apiRequestAuth');

      const mockError = new Error('Test error');

      apiRequestAuthMock.mockRejectedValue(mockError);

      await getHtmlUrl(
        mockGitHubCloudAccount,
        'https://api.github.com/repos/gitify-app/gitify/issues/785' as Link,
      );

      expect(rendererLogErrorSpy).toHaveBeenCalledTimes(1);
    });
  });
});
