import { mockGitHubCloudAccount } from '../../__mocks__/account-mocks';
import {
  mockGitHubCloudGitifyNotifications,
  mockPartialGitifyNotification,
} from '../../__mocks__/notifications-mocks';
import { mockToken } from '../../__mocks__/state-mocks';

import { Constants } from '../../constants';

import type { Hostname, Link, SettingsState } from '../../types';
import type { GitHubGraphQLResponse } from './graphql/types';

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
import * as octokitModule from './octokit';
import * as apiRequests from './request';

const mockGitHubHostname = 'github.com' as Hostname;
const mockThreadId = '1234';

describe('renderer/utils/api/client.ts', () => {
  const performAuthenticatedRESTRequestSpy = jest.spyOn(
    apiRequests,
    'performAuthenticatedRESTRequest',
  );

  const mockOctokit = {
    rest: {
      activity: {
        listNotificationsForAuthenticatedUser: jest.fn(),
      },
    },
    paginate: jest.fn(),
  };

  const createOctokitClientSpy = jest.spyOn(
    octokitModule,
    'createOctokitClient',
  );

  beforeEach(() => {
    // Mock performAuthenticatedRESTRequest to return a valid response
    performAuthenticatedRESTRequestSpy.mockResolvedValue({
      data: {},
      status: 200,
      statusText: 'OK',
      headers: {},
      // biome-ignore lint/suspicious/noExplicitAny: AxiosResponse config type
      config: {} as any,
    });

    // Mock createOctokitClient to return our mock
    createOctokitClientSpy.mockResolvedValue(mockOctokit as any);

    // Mock Octokit REST method
    mockOctokit.rest.activity.listNotificationsForAuthenticatedUser.mockResolvedValue(
      {
        data: [],
        status: 200,
        headers: {},
      },
    );

    // Mock paginate
    mockOctokit.paginate.mockResolvedValue([]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('headNotifications - should fetch notifications head', async () => {
    await headNotifications(mockGitHubHostname, mockToken);

    expect(performAuthenticatedRESTRequestSpy).toHaveBeenCalledWith(
      'HEAD',
      'https://api.github.com/notifications',
      mockToken,
    );
  });

  describe('listNotificationsForAuthenticatedUser', () => {
    it('should list only participating notifications for user', async () => {
      const mockSettings: Partial<SettingsState> = {
        participating: true,
        fetchReadNotifications: false,
        fetchAllNotifications: false,
      };

      await listNotificationsForAuthenticatedUser(
        mockGitHubCloudAccount,
        mockSettings as SettingsState,
      );

      expect(createOctokitClientSpy).toHaveBeenCalledWith(
        mockGitHubCloudAccount.hostname,
        mockGitHubCloudAccount.token,
      );
      expect(
        mockOctokit.rest.activity.listNotificationsForAuthenticatedUser,
      ).toHaveBeenCalledWith({
        participating: true,
        all: false,
        per_page: 100,
      });
    });

    it('should list participating and watching notifications for user', async () => {
      const mockSettings: Partial<SettingsState> = {
        participating: false,
        fetchReadNotifications: false,
        fetchAllNotifications: false,
      };

      await listNotificationsForAuthenticatedUser(
        mockGitHubCloudAccount,
        mockSettings as SettingsState,
      );

      expect(
        mockOctokit.rest.activity.listNotificationsForAuthenticatedUser,
      ).toHaveBeenCalledWith({
        participating: false,
        all: false,
        per_page: 100,
      });
    });

    it('should list read and done notifications for user', async () => {
      const mockSettings: Partial<SettingsState> = {
        participating: false,
        fetchReadNotifications: true,
        fetchAllNotifications: false,
      };

      await listNotificationsForAuthenticatedUser(
        mockGitHubCloudAccount,
        mockSettings as SettingsState,
      );

      expect(
        mockOctokit.rest.activity.listNotificationsForAuthenticatedUser,
      ).toHaveBeenCalledWith({
        participating: false,
        all: true,
        per_page: 100,
      });
    });

    it('should unpaginate notifications list for user', async () => {
      const mockSettings: Partial<SettingsState> = {
        participating: false,
        fetchReadNotifications: false,
        fetchAllNotifications: true,
      };

      await listNotificationsForAuthenticatedUser(
        mockGitHubCloudAccount,
        mockSettings as SettingsState,
      );

      expect(mockOctokit.paginate).toHaveBeenCalledWith(
        mockOctokit.rest.activity.listNotificationsForAuthenticatedUser,
        {
          participating: false,
          all: false,
          per_page: 100,
        },
      );
    });
  });

  it('markNotificationThreadAsRead - should mark notification thread as read', async () => {
    await markNotificationThreadAsRead(mockGitHubCloudAccount,
      mockThreadId,

    );

    expect(performAuthenticatedRESTRequestSpy).toHaveBeenCalledWith(
      'PATCH',
      `https://api.github.com/notifications/threads/${mockThreadId}`,
      mockToken,
      {},
    );
  });

  it('markNotificationThreadAsDone - should mark notification thread as done', async () => {
    await markNotificationThreadAsDone(mockGitHubCloudAccount,
      mockThreadId,

    );

    expect(performAuthenticatedRESTRequestSpy).toHaveBeenCalledWith(
      'DELETE',
      `https://api.github.com/notifications/threads/${mockThreadId}`,
      mockToken,
      {},
    );
  });

  it('ignoreNotificationThreadSubscription - should ignore notification thread subscription', async () => {
    await ignoreNotificationThreadSubscription(mockGitHubCloudAccount,
      mockThreadId,

    );

    expect(performAuthenticatedRESTRequestSpy).toHaveBeenCalledWith(
      'PUT',
      `https://api.github.com/notifications/threads/${mockThreadId}/subscription`,
      mockToken,
      { ignored: true },
    );
  });

  it('getHtmlUrl - should return the HTML URL', async () => {
    await getHtmlUrl(
      mockGitHubCloudAccount,
      'https://api.github.com/repos/gitify-app/notifications-test/issues/785' as Link,

    );

    expect(performAuthenticatedRESTRequestSpy).toHaveBeenCalledWith(
      'GET',
      'https://api.github.com/repos/gitify-app/notifications-test/issues/785',
      '123',
    );
  });

  it('fetchAuthenticatedUserDetails calls performGraphQLRequest with correct args', async () => {
    const performGraphQLRequestSpy = jest.spyOn(
      apiRequests,
      'performGraphQLRequest',
    );

    performGraphQLRequestSpy.mockResolvedValue({
      data: {},
      headers: {},
    } as GitHubGraphQLResponse<FetchAuthenticatedUserDetailsQuery>);

    await fetchAuthenticatedUserDetails(mockGitHubHostname, mockToken);

    expect(performGraphQLRequestSpy).toHaveBeenCalledWith(
      'https://api.github.com/graphql',
      mockToken,
      FetchAuthenticatedUserDetailsDocument,
    );
  });

  it('fetchDiscussionByNumber calls performGraphQLRequest with correct args', async () => {
    const performGraphQLRequestSpy = jest.spyOn(
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
    } as GitHubGraphQLResponse<FetchDiscussionByNumberQuery>);

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
    const performGraphQLRequestSpy = jest.spyOn(
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
    } as GitHubGraphQLResponse<FetchIssueByNumberQuery>);

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
    const performGraphQLRequestSpy = jest.spyOn(
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
    } as GitHubGraphQLResponse<FetchPullRequestByNumberQuery>);

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
      const performGraphQLRequestStringSpy = jest.spyOn(
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
      } as GitHubGraphQLResponse<unknown>);

      await fetchNotificationDetailsForList([mockNotification]);

      expect(performGraphQLRequestStringSpy).not.toHaveBeenCalled();
    });

    it('fetchNotificationDetailsForList returns empty map if no supported notifications', async () => {
      const performGraphQLRequestStringSpy = jest.spyOn(
        apiRequests,
        'performGraphQLRequestString',
      );

      performGraphQLRequestStringSpy.mockResolvedValue({
        data: {},
        headers: {},
      } as GitHubGraphQLResponse<unknown>);

      await fetchNotificationDetailsForList([]);

      expect(performGraphQLRequestStringSpy).not.toHaveBeenCalled();
    });

    it('fetchNotificationDetailsForList returns empty map if no notifications', async () => {
      const performGraphQLRequestStringSpy = jest.spyOn(
        apiRequests,
        'performGraphQLRequestString',
      );

      performGraphQLRequestStringSpy.mockResolvedValue({
        data: {},
        headers: {},
      } as GitHubGraphQLResponse<unknown>);

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
