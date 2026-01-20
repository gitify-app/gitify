import type { AxiosResponse } from 'axios';
import { vi } from 'vitest';

import {
  createMockResponse,
  fetch,
} from '../../__mocks__/@tauri-apps/plugin-http';
import { mockGitHubCloudAccount } from '../../__mocks__/account-mocks';
import {
  mockGitHubCloudGitifyNotifications,
  mockPartialGitifyNotification,
} from '../../__mocks__/notifications-mocks';
import { mockToken } from '../../__mocks__/state-mocks';
import {
  mockAuthHeaders,
  mockNonCachedAuthHeaders,
} from './__mocks__/request-mocks';

import { Constants } from '../../constants';

import type { Hostname, Link, SettingsState, Token } from '../../types';

import * as logger from '../../utils/logger';
import {
  fetchAuthenticatedUserDetails,
  fetchDiscussionByNumber,
  fetchIssueByNumber,
  fetchNotificationDetailsForList,
  fetchPullByNumber,
  getHtmlUrl,
  headNotifications,
  ignoreNotificationThreadSubscription,
  listNotificationsForAuthenticatedUser,
  markNotificationThreadAsDone,
  markNotificationThreadAsRead,
} from './client';
import {
  FetchAuthenticatedUserDetailsDocument,
  type FetchAuthenticatedUserDetailsQuery,
  FetchDiscussionByNumberDocument,
  type FetchDiscussionByNumberQuery,
  FetchIssueByNumberDocument,
  type FetchIssueByNumberQuery,
  FetchPullRequestByNumberDocument,
  type FetchPullRequestByNumberQuery,
} from './graphql/generated/graphql';
import type { ExecutionResultWithHeaders } from './request';
import * as apiRequests from './request';

// Mock decryptValue for consistent test expectations
vi.mock('../comms', () => ({
  decryptValue: vi.fn().mockResolvedValue('decrypted'),
}));

const mockGitHubHostname = 'github.com' as Hostname;
const mockThreadId = '1234';

describe('renderer/utils/api/client.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetch.mockResolvedValue(createMockResponse({}));
  });

  it('headNotifications - should fetch notifications head', async () => {
    await headNotifications(mockGitHubHostname, mockToken);

    expect(fetch).toHaveBeenCalledWith('https://api.github.com/notifications', {
      method: 'HEAD',
      headers: mockNonCachedAuthHeaders,
      body: undefined,
    });
  });

  describe('listNotificationsForAuthenticatedUser', () => {
    it('should list only participating notifications for user', async () => {
      const mockSettings: Partial<SettingsState> = {
        participating: true,
        fetchReadNotifications: false,
      };

      await listNotificationsForAuthenticatedUser(
        mockGitHubCloudAccount,
        mockSettings as SettingsState,
      );

      expect(fetch).toHaveBeenCalledWith(
        'https://api.github.com/notifications?participating=true&all=false',
        {
          method: 'GET',
          headers: mockNonCachedAuthHeaders,
          body: undefined,
        },
      );
    });

    it('should list participating and watching notifications for user', async () => {
      const mockSettings: Partial<SettingsState> = {
        participating: false,
        fetchReadNotifications: false,
      };

      await listNotificationsForAuthenticatedUser(
        mockGitHubCloudAccount,
        mockSettings as SettingsState,
      );

      expect(fetch).toHaveBeenCalledWith(
        'https://api.github.com/notifications?participating=false&all=false',
        {
          method: 'GET',
          headers: mockNonCachedAuthHeaders,
          body: undefined,
        },
      );
    });
  });

  it('markNotificationThreadAsRead - should mark notification thread as read', async () => {
    await markNotificationThreadAsRead(
      mockThreadId,
      mockGitHubHostname,
      mockToken,
    );

    expect(fetch).toHaveBeenCalledWith(
      `https://api.github.com/notifications/threads/${mockThreadId}`,
      {
        method: 'PATCH',
        headers: mockAuthHeaders,
        body: '{}',
      },
    );
  });

  it('markNotificationThreadAsDone - should mark notification thread as done', async () => {
    await markNotificationThreadAsDone(
      mockThreadId,
      mockGitHubHostname,
      mockToken,
    );

    expect(fetch).toHaveBeenCalledWith(
      `https://api.github.com/notifications/threads/${mockThreadId}`,
      {
        method: 'DELETE',
        headers: mockAuthHeaders,
        body: '{}',
      },
    );
  });

  it('ignoreNotificationThreadSubscription - should ignore notification thread subscription', async () => {
    await ignoreNotificationThreadSubscription(
      mockThreadId,
      mockGitHubHostname,
      mockToken,
    );

    expect(fetch).toHaveBeenCalledWith(
      `https://api.github.com/notifications/threads/${mockThreadId}/subscription`,
      {
        method: 'PUT',
        headers: mockAuthHeaders,
        body: JSON.stringify({ ignored: true }),
      },
    );
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

  it('fetchAuthenticatedUserDetails calls performGraphQLRequest with correct args', async () => {
    const performGraphQLRequestSpy = vi.spyOn(
      apiRequests,
      'performGraphQLRequest',
    );

    performGraphQLRequestSpy.mockResolvedValue({
      data: {},
      headers: {},
    } as ExecutionResultWithHeaders<FetchAuthenticatedUserDetailsQuery>);

    await fetchAuthenticatedUserDetails(mockGitHubHostname, mockToken);

    expect(performGraphQLRequestSpy).toHaveBeenCalledWith(
      'https://api.github.com/graphql',
      mockToken,
      FetchAuthenticatedUserDetailsDocument,
    );
  });

  it('fetchDiscussionByNumber calls performGraphQLRequest with correct args', async () => {
    const performGraphQLRequestSpy = vi.spyOn(
      apiRequests,
      'performGraphQLRequest',
    );

    const mockNotification = mockPartialGitifyNotification({
      title: 'Some discussion',
      url: 'https://api.github.com/repos/gitify-app/gitify/discussion/123' as Link,
      type: 'Discussion',
    });

    performGraphQLRequestSpy.mockResolvedValue({
      data: {},
      headers: {},
    } as ExecutionResultWithHeaders<FetchDiscussionByNumberQuery>);

    await fetchDiscussionByNumber(mockNotification);

    expect(performGraphQLRequestSpy).toHaveBeenCalledWith(
      'https://api.github.com/graphql',
      mockNotification.account.token,
      FetchDiscussionByNumberDocument,
      {
        owner: mockNotification.repository.owner.login,
        name: mockNotification.repository.name,
        number: 123,
        firstLabels: Constants.GRAPHQL_ARGS.FIRST_LABELS,
        lastThreadedComments: Constants.GRAPHQL_ARGS.LAST_THREADED_COMMENTS,
        lastReplies: Constants.GRAPHQL_ARGS.LAST_REPLIES,
        includeIsAnswered: true,
      },
    );
  });

  it('fetchIssueByNumber calls performGraphQLRequest with correct args', async () => {
    const performGraphQLRequestSpy = vi.spyOn(
      apiRequests,
      'performGraphQLRequest',
    );

    const mockNotification = mockPartialGitifyNotification({
      title: 'Some issue',
      url: 'https://api.github.com/repos/gitify-app/gitify/issues/123' as Link,
      type: 'Issue',
    });

    performGraphQLRequestSpy.mockResolvedValue({
      data: {},
      headers: {},
    } as ExecutionResultWithHeaders<FetchIssueByNumberQuery>);

    await fetchIssueByNumber(mockNotification);

    expect(performGraphQLRequestSpy).toHaveBeenCalledWith(
      'https://api.github.com/graphql',
      mockNotification.account.token,
      FetchIssueByNumberDocument,
      {
        owner: mockNotification.repository.owner.login,
        name: mockNotification.repository.name,
        number: 123,
        firstLabels: Constants.GRAPHQL_ARGS.FIRST_LABELS,
        lastComments: Constants.GRAPHQL_ARGS.LAST_COMMENTS,
      },
    );
  });

  it('fetchPullByNumber calls performGraphQLRequest with correct args', async () => {
    const performGraphQLRequestSpy = vi.spyOn(
      apiRequests,
      'performGraphQLRequest',
    );

    const mockNotification = mockPartialGitifyNotification({
      title: 'Some pull request',
      url: 'https://api.github.com/repos/gitify-app/gitify/pulls/123' as Link,
      type: 'PullRequest',
    });

    performGraphQLRequestSpy.mockResolvedValue({
      data: {},
      headers: {},
    } as ExecutionResultWithHeaders<FetchPullRequestByNumberQuery>);

    await fetchPullByNumber(mockNotification);

    expect(performGraphQLRequestSpy).toHaveBeenCalledWith(
      'https://api.github.com/graphql',
      mockNotification.account.token,
      FetchPullRequestByNumberDocument,
      {
        owner: mockNotification.repository.owner.login,
        name: mockNotification.repository.name,
        number: 123,
        firstClosingIssues: Constants.GRAPHQL_ARGS.FIRST_CLOSING_ISSUES,
        firstLabels: Constants.GRAPHQL_ARGS.FIRST_LABELS,
        lastComments: Constants.GRAPHQL_ARGS.LAST_COMMENTS,
        lastReviews: Constants.GRAPHQL_ARGS.LAST_REVIEWS,
      },
    );
  });

  describe('fetchNotificationDetailsForList', () => {
    it('fetchNotificationDetailsForList returns empty map if no notifications', async () => {
      const performGraphQLRequestStringSpy = vi.spyOn(
        apiRequests,
        'performGraphQLRequestString',
      );

      const mockNotification = mockPartialGitifyNotification({
        title: 'Some commit',
        url: 'https://api.github.com/repos/gitify-app/gitify/commit/123' as Link,
        type: 'Commit',
      });

      performGraphQLRequestStringSpy.mockResolvedValue({
        data: {},
        headers: {},
      } as ExecutionResultWithHeaders<unknown>);

      await fetchNotificationDetailsForList([mockNotification]);

      expect(performGraphQLRequestStringSpy).not.toHaveBeenCalled();
    });

    it('fetchNotificationDetailsForList returns empty map if no supported notifications', async () => {
      const performGraphQLRequestStringSpy = vi.spyOn(
        apiRequests,
        'performGraphQLRequestString',
      );

      performGraphQLRequestStringSpy.mockResolvedValue({
        data: {},
        headers: {},
      } as ExecutionResultWithHeaders<unknown>);

      await fetchNotificationDetailsForList([]);

      expect(performGraphQLRequestStringSpy).not.toHaveBeenCalled();
    });

    it('fetchNotificationDetailsForList returns empty map if no notifications', async () => {
      const performGraphQLRequestStringSpy = vi.spyOn(
        apiRequests,
        'performGraphQLRequestString',
      );

      performGraphQLRequestStringSpy.mockResolvedValue({
        data: {},
        headers: {},
      } as ExecutionResultWithHeaders<unknown>);

      await fetchNotificationDetailsForList(mockGitHubCloudGitifyNotifications);

      expect(performGraphQLRequestStringSpy).toHaveBeenCalledWith(
        'https://api.github.com/graphql',
        mockToken,
        expect.stringMatching(/node0|node1/),
        {
          firstClosingIssues: 100,
          firstLabels: 100,
          includeIsAnswered: true,
          isDiscussionNotification0: false,
          isDiscussionNotification1: false,
          isIssueNotification0: true,
          isIssueNotification1: true,
          isPullRequestNotification0: false,
          isPullRequestNotification1: false,
          lastComments: 1,
          lastReplies: 10,
          lastReviews: 100,
          lastThreadedComments: 10,
          name0: 'notifications-test',
          name1: 'notifications-test',
          number0: 1,
          number1: 4,
          owner0: 'gitify-app',
          owner1: 'gitify-app',
        },
      );
    });
  });
});
