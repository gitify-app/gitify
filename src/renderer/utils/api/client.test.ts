import type { ExecutionResult } from 'graphql';

import { mockGitHubCloudAccount } from '../../__mocks__/account-mocks';
import {
  mockGitHubCloudGitifyNotifications,
  mockPartialGitifyNotification,
} from '../../__mocks__/notifications-mocks';

import { Constants } from '../../constants';

import type { Link, SettingsState } from '../../types';

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
  FetchDiscussionByNumberDocument,
  type FetchDiscussionByNumberQuery,
  FetchIssueByNumberDocument,
  type FetchIssueByNumberQuery,
  FetchPullRequestByNumberDocument,
  type FetchPullRequestByNumberQuery,
} from './graphql/generated/graphql';
import * as octokitModule from './octokit';
import * as apiRequests from './request';

const mockThreadId = '1234';

describe('renderer/utils/api/client.ts', () => {
  const mockOctokit = {
    rest: {
      activity: {
        listNotificationsForAuthenticatedUser: jest.fn(),
        markThreadAsRead: jest.fn(),
        markThreadAsDone: jest.fn(),
        setThreadSubscription: jest.fn(),
      },
      users: {
        getAuthenticated: jest.fn(),
      },
    },
    paginate: jest.fn(),
    request: jest.fn(),
  };

  const createOctokitClientSpy = jest.spyOn(
    octokitModule,
    'createOctokitClient',
  );

  beforeEach(() => {
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

    // Mock generic request used by followUrl/getHtmlUrl
    mockOctokit.request.mockResolvedValue({
      data: {},
      status: 200,
      headers: {},
    });

    mockOctokit.rest.users.getAuthenticated.mockResolvedValue({
      data: {},
      status: 200,
      headers: {},
    });

    // Mock other activity endpoints used by client
    mockOctokit.rest.activity.markThreadAsRead.mockResolvedValue({
      data: {},
      status: 200,
      headers: {},
    });
    mockOctokit.rest.activity.markThreadAsDone.mockResolvedValue({
      data: {},
      status: 200,
      headers: {},
    });
    mockOctokit.rest.activity.setThreadSubscription.mockResolvedValue({
      data: {},
      status: 200,
      headers: {},
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetchAuthenticatedUserDetails - should fetch authenticated user', async () => {
    await fetchAuthenticatedUserDetails(mockGitHubCloudAccount);

    expect(createOctokitClientSpy).toHaveBeenCalledWith(
      mockGitHubCloudAccount,
      'rest',
      false,
    );
    expect(mockOctokit.rest.users.getAuthenticated).toHaveBeenCalled();
  });

  it('headNotifications - should fetch notifications head', async () => {
    await headNotifications(mockGitHubCloudAccount);

    expect(createOctokitClientSpy).toHaveBeenCalledWith(
      mockGitHubCloudAccount,
      'rest',
    );
    expect(
      mockOctokit.rest.activity.listNotificationsForAuthenticatedUser,
    ).toHaveBeenCalledWith({ per_page: 1 });
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
        mockGitHubCloudAccount,
        'rest',
      );
      expect(
        mockOctokit.rest.activity.listNotificationsForAuthenticatedUser,
      ).toHaveBeenCalledWith({
        participating: true,
        all: false,
        per_page: 100,
        headers: {
          'Cache-Control': 'no-cache',
        },
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

      expect(createOctokitClientSpy).toHaveBeenCalledWith(
        mockGitHubCloudAccount,
        'rest',
      );
      expect(
        mockOctokit.rest.activity.listNotificationsForAuthenticatedUser,
      ).toHaveBeenCalledWith({
        participating: false,
        all: false,
        per_page: 100,
        headers: {
          'Cache-Control': 'no-cache',
        },
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

      expect(createOctokitClientSpy).toHaveBeenCalledWith(
        mockGitHubCloudAccount,
        'rest',
      );
      expect(
        mockOctokit.rest.activity.listNotificationsForAuthenticatedUser,
      ).toHaveBeenCalledWith({
        participating: false,
        all: true,
        per_page: 100,
        headers: {
          'Cache-Control': 'no-cache',
        },
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

      expect(createOctokitClientSpy).toHaveBeenCalledWith(
        mockGitHubCloudAccount,
        'rest',
      );
      expect(mockOctokit.paginate).toHaveBeenCalledWith(
        mockOctokit.rest.activity.listNotificationsForAuthenticatedUser,
        {
          participating: false,
          all: false,
          per_page: 100,
          headers: {
            'Cache-Control': 'no-cache',
          },
        },
      );
    });
  });

  it('markNotificationThreadAsRead - should mark notification thread as read', async () => {
    await markNotificationThreadAsRead(mockGitHubCloudAccount, mockThreadId);

    expect(createOctokitClientSpy).toHaveBeenCalledWith(
      mockGitHubCloudAccount,
      'rest',
    );
    expect(mockOctokit.rest.activity.markThreadAsRead).toHaveBeenCalledWith({
      thread_id: Number(mockThreadId),
    });
  });

  it('markNotificationThreadAsDone - should mark notification thread as done', async () => {
    await markNotificationThreadAsDone(mockGitHubCloudAccount, mockThreadId);

    expect(createOctokitClientSpy).toHaveBeenCalledWith(
      mockGitHubCloudAccount,
      'rest',
    );
    expect(mockOctokit.rest.activity.markThreadAsDone).toHaveBeenCalledWith({
      thread_id: Number(mockThreadId),
    });
  });

  it('ignoreNotificationThreadSubscription - should ignore notification thread subscription', async () => {
    await ignoreNotificationThreadSubscription(
      mockGitHubCloudAccount,
      mockThreadId,
    );

    expect(createOctokitClientSpy).toHaveBeenCalledWith(
      mockGitHubCloudAccount,
      'rest',
    );
    expect(
      mockOctokit.rest.activity.setThreadSubscription,
    ).toHaveBeenCalledWith({
      thread_id: Number(mockThreadId),
      ignored: true,
    });
  });

  it('getHtmlUrl - should return the HTML URL', async () => {
    await getHtmlUrl(
      mockGitHubCloudAccount,
      'https://api.github.com/repos/gitify-app/notifications-test/issues/785' as Link,
    );

    expect(createOctokitClientSpy).toHaveBeenCalledWith(
      mockGitHubCloudAccount,
      'rest',
    );
    expect(mockOctokit.request).toHaveBeenCalledWith('GET {+url}', {
      url: 'https://api.github.com/repos/gitify-app/notifications-test/issues/785',
    });
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

    performGraphQLRequestSpy.mockResolvedValue(
      {} as ExecutionResult<FetchDiscussionByNumberQuery>,
    );

    await fetchDiscussionByNumber(mockNotification);

    expect(performGraphQLRequestSpy).toHaveBeenCalledWith(
      mockNotification.account,
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

    performGraphQLRequestSpy.mockResolvedValue(
      {} as ExecutionResult<FetchIssueByNumberQuery>,
    );

    await fetchIssueByNumber(mockNotification);

    expect(performGraphQLRequestSpy).toHaveBeenCalledWith(
      mockNotification.account,
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

    performGraphQLRequestSpy.mockResolvedValue(
      {} as ExecutionResult<FetchPullRequestByNumberQuery>,
    );

    await fetchPullByNumber(mockNotification);

    expect(performGraphQLRequestSpy).toHaveBeenCalledWith(
      mockNotification.account,
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

      performGraphQLRequestStringSpy.mockResolvedValue(
        {} as ExecutionResult<unknown>,
      );

      await fetchNotificationDetailsForList([mockNotification]);

      expect(performGraphQLRequestStringSpy).not.toHaveBeenCalled();
    });

    it('fetchNotificationDetailsForList returns empty map if no supported notifications', async () => {
      const performGraphQLRequestStringSpy = jest.spyOn(
        apiRequests,
        'performGraphQLRequestString',
      );

      performGraphQLRequestStringSpy.mockResolvedValue(
        {} as ExecutionResult<unknown>,
      );

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
      } as ExecutionResult<unknown>);

      await fetchNotificationDetailsForList(mockGitHubCloudGitifyNotifications);

      expect(performGraphQLRequestStringSpy).toHaveBeenCalledWith(
        mockGitHubCloudGitifyNotifications[0].account,
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
