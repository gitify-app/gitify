import axios, { type AxiosResponse } from 'axios';

import { mockGitHubCloudAccount } from '../../__mocks__/account-mocks';
import { mockToken } from '../../__mocks__/state-mocks';
import type { Hostname, Link, SettingsState, Token } from '../../types';
import * as logger from '../../utils/logger';
import {
  mockAuthHeaders,
  mockNonCachedAuthHeaders,
} from './__mocks__/request-mocks';
import {
  getHtmlUrl,
  headNotifications,
  ignoreNotificationThreadSubscription,
  listNotificationsForAuthenticatedUser,
  markNotificationThreadAsDone,
  markNotificationThreadAsRead,
} from './client';
import * as apiRequests from './request';

vi.mock('axios');

const mockGitHubHostname = 'github.com' as Hostname;
const mockThreadId = '1234';

describe('renderer/utils/api/client.ts', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('headNotifications - should fetch notifications head', async () => {
    await headNotifications(mockGitHubHostname, mockToken);

    expect(axios).toHaveBeenCalledWith({
      url: 'https://api.github.com/notifications',
      headers: mockNonCachedAuthHeaders,
      method: 'HEAD',
      data: {},
    });
  });

  describe('listNotificationsForAuthenticatedUser', () => {
    it('should list only participating notifications for user', async () => {
      const mockSettings: Partial<SettingsState> = {
        participating: true,
      };

      await listNotificationsForAuthenticatedUser(
        mockGitHubCloudAccount,
        mockSettings as SettingsState,
      );

      expect(axios).toHaveBeenCalledWith({
        url: 'https://api.github.com/notifications?participating=true',
        headers: mockNonCachedAuthHeaders,
        method: 'GET',
        data: {},
      });
    });

    it('should list participating and watching notifications for user', async () => {
      const mockSettings: Partial<SettingsState> = {
        participating: false,
      };

      await listNotificationsForAuthenticatedUser(
        mockGitHubCloudAccount,
        mockSettings as SettingsState,
      );

      expect(axios).toHaveBeenCalledWith({
        url: 'https://api.github.com/notifications?participating=false',
        headers: mockNonCachedAuthHeaders,
        method: 'GET',
        data: {},
      });
    });
  });

  it('markNotificationThreadAsRead - should mark notification thread as read', async () => {
    await markNotificationThreadAsRead(
      mockThreadId,
      mockGitHubHostname,
      mockToken,
    );

    expect(axios).toHaveBeenCalledWith({
      url: `https://api.github.com/notifications/threads/${mockThreadId}`,
      headers: mockAuthHeaders,
      method: 'PATCH',
      data: {},
    });
  });

  it('markNotificationThreadAsDone - should mark notification thread as done', async () => {
    await markNotificationThreadAsDone(
      mockThreadId,
      mockGitHubHostname,
      mockToken,
    );

    expect(axios).toHaveBeenCalledWith({
      url: `https://api.github.com/notifications/threads/${mockThreadId}`,
      headers: mockAuthHeaders,
      method: 'DELETE',
      data: {},
    });
  });

  it('ignoreNotificationThreadSubscription - should ignore notification thread subscription', async () => {
    await ignoreNotificationThreadSubscription(
      mockThreadId,
      mockGitHubHostname,
      mockToken,
    );

    expect(axios).toHaveBeenCalledWith({
      url: `https://api.github.com/notifications/threads/${mockThreadId}/subscription`,
      headers: mockAuthHeaders,
      method: 'PUT',
      data: { ignored: true },
    });
  });

  describe('getHtmlUrl', () => {
    it('should return the HTML URL', async () => {
      const apiRequestAuthSpy = vi.spyOn(apiRequests, 'apiRequestAuth');

      apiRequestAuthSpy.mockResolvedValue({
        data: {
          html_url:
            'https://github.com/gitify-app/notifications-test/issues/785',
        },
      } as AxiosResponse);

      const result = await getHtmlUrl(
        'https://api.github.com/repos/gitify-app/notifications-test/issues/785' as Link,
        '123' as Token,
      );
      expect(result).toBe(
        'https://github.com/gitify-app/notifications-test/issues/785',
      );
    });

    it('should handle error', async () => {
      const rendererLogErrorSpy = vi
        .spyOn(logger, 'rendererLogError')
        .mockImplementation(() => {});

      const apiRequestAuthSpy = vi.spyOn(apiRequests, 'apiRequestAuth');

      const mockError = new Error('Test error');

      apiRequestAuthSpy.mockRejectedValue(mockError);

      await getHtmlUrl(
        'https://api.github.com/repos/gitify-app/gitify/issues/785' as Link,
        '123' as Token,
      );

      expect(rendererLogErrorSpy).toHaveBeenCalledTimes(1);
    });
  });
});
