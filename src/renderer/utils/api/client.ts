import type { AxiosPromise } from 'axios';
import type { ExecutionResult } from 'graphql';

import type {
  Account,
  GitifyNotification,
  Hostname,
  Link,
  SettingsState,
  Token,
} from '../../types';
import { isAnsweredDiscussionFeatureSupported } from '../features';
import { rendererLogError } from '../logger';
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
import {
  apiRequestAuth,
  type ExecutionResultWithHeaders,
  performGraphQLRequest,
} from './request';
import type {
  NotificationThreadSubscription,
  RawCommit,
  RawCommitComment,
  RawGitHubNotification,
  RawRelease,
} from './types';
import {
  getGitHubAPIBaseUrl,
  getGitHubGraphQLUrl,
  getNumberFromUrl,
} from './utils';

/**
 * Perform a HEAD operation, used to validate that connectivity is established.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/activity/notifications
 */
export function headNotifications(
  hostname: Hostname,
  token: Token,
): AxiosPromise<void> {
  const url = getGitHubAPIBaseUrl(hostname);
  url.pathname += 'notifications';

  return apiRequestAuth(url.toString() as Link, 'HEAD', token);
}

/**
 * List all notifications for the current user, sorted by most recently updated.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/activity/notifications#list-notifications-for-the-authenticated-user
 */
export function listNotificationsForAuthenticatedUser(
  account: Account,
  settings: SettingsState,
): AxiosPromise<RawGitHubNotification[]> {
  const url = getGitHubAPIBaseUrl(account.hostname);
  url.pathname += 'notifications';
  url.searchParams.append('participating', String(settings.participating));

  return apiRequestAuth(
    url.toString() as Link,
    'GET',
    account.token,
    {},
    settings.fetchAllNotifications,
  );
}

/**
 * Marks a thread as "read." Marking a thread as "read" is equivalent to
 * clicking a notification in your notification inbox on GitHub.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/activity/notifications#mark-a-thread-as-read
 */
export function markNotificationThreadAsRead(
  threadId: string,
  hostname: Hostname,
  token: Token,
): AxiosPromise<void> {
  const url = getGitHubAPIBaseUrl(hostname);
  url.pathname += `notifications/threads/${threadId}`;

  return apiRequestAuth(url.toString() as Link, 'PATCH', token, {});
}

/**
 * Marks a thread as "done." Marking a thread as "done" is equivalent to marking a
 * notification in your notification inbox on GitHub as done.
 *
 * NOTE: This was added to GitHub Enterprise Server in version 3.13 or later.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/activity/notifications#mark-a-thread-as-done
 */
export function markNotificationThreadAsDone(
  threadId: string,
  hostname: Hostname,
  token: Token,
): AxiosPromise<void> {
  const url = getGitHubAPIBaseUrl(hostname);
  url.pathname += `notifications/threads/${threadId}`;

  return apiRequestAuth(url.toString() as Link, 'DELETE', token, {});
}

/**
 * Ignore future notifications for threads until you comment on the thread or get a `@mention`.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/activity/notifications#delete-a-thread-subscription
 */
export function ignoreNotificationThreadSubscription(
  threadId: string,
  hostname: Hostname,
  token: Token,
): AxiosPromise<NotificationThreadSubscription> {
  const url = getGitHubAPIBaseUrl(hostname);
  url.pathname += `notifications/threads/${threadId}/subscription`;

  return apiRequestAuth(url.toString() as Link, 'PUT', token, {
    ignored: true,
  });
}

/**
 * Returns the contents of a single commit reference.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/commits/commits#get-a-commit
 */
export function getCommit(url: Link, token: Token): AxiosPromise<RawCommit> {
  return apiRequestAuth(url, 'GET', token);
}

/**
 * Gets a specified commit comment.
 * 
 * Endpoint documentation: https://docs.github.com/en/rest/commits/comments#get-a-commit-comment

 */
export function getCommitComment(
  url: Link,
  token: Token,
): AxiosPromise<RawCommitComment> {
  return apiRequestAuth(url, 'GET', token);
}

/**
 * Gets a public release with the specified release ID.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/releases/releases#get-a-release
 */
export function getRelease(url: Link, token: Token): AxiosPromise<RawRelease> {
  return apiRequestAuth(url, 'GET', token);
}

/**
 * Get the `html_url` from the GitHub response
 */
export async function getHtmlUrl(url: Link, token: Token): Promise<string> {
  try {
    const response = (await apiRequestAuth(url, 'GET', token)).data;

    return response.html_url;
  } catch (err) {
    rendererLogError(
      'getHtmlUrl',
      `error occurred while fetching html url for ${url}`,
      err,
    );
  }
}

/**
 * Fetch details of the currently authenticated GitHub user.
 */
export async function fetchAuthenticatedUserDetails(
  hostname: Hostname,
  token: Token,
): Promise<ExecutionResultWithHeaders<FetchAuthenticatedUserDetailsQuery>> {
  const url = getGitHubGraphQLUrl(hostname);

  return performGraphQLRequest(
    url.toString() as Link,
    token,
    FetchAuthenticatedUserDetailsDocument,
  );
}

/**
 * Fetch GitHub Issue by Issue Number.
 */
export async function fetchIssueByNumber(
  notification: GitifyNotification,
): Promise<ExecutionResult<FetchIssueByNumberQuery>> {
  const url = getGitHubGraphQLUrl(notification.account.hostname);
  const number = getNumberFromUrl(notification.subject.url);

  return performGraphQLRequest(
    url.toString() as Link,
    notification.account.token,
    FetchIssueByNumberDocument,
    {
      owner: notification.repository.owner.login,
      name: notification.repository.name,
      number: number,
      firstLabels: 100,
      lastComments: 1,
    },
  );
}

/**
 * Fetch GitHub Pull Request by PR Number.
 */
export async function fetchPullByNumber(
  notification: GitifyNotification,
): Promise<ExecutionResult<FetchPullRequestByNumberQuery>> {
  const url = getGitHubGraphQLUrl(notification.account.hostname);
  const number = getNumberFromUrl(notification.subject.url);

  return performGraphQLRequest(
    url.toString() as Link,
    notification.account.token,
    FetchPullRequestByNumberDocument,
    {
      owner: notification.repository.owner.login,
      name: notification.repository.name,
      number: number,
      firstLabels: 100,
      firstClosingIssues: 100,
      lastComments: 1,
      lastReviews: 100,
    },
  );
}

/**
 * Fetch GitHub Discussion by Discussion Number.
 */
export async function fetchDiscussionByNumber(
  notification: GitifyNotification,
): Promise<ExecutionResult<FetchDiscussionByNumberQuery>> {
  const url = getGitHubGraphQLUrl(notification.account.hostname);
  const number = getNumberFromUrl(notification.subject.url);

  return performGraphQLRequest(
    url.toString() as Link,
    notification.account.token,
    FetchDiscussionByNumberDocument,
    {
      owner: notification.repository.owner.login,
      name: notification.repository.name,
      number: number,
      lastComments: 10,
      lastReplies: 10,
      firstLabels: 100,
      includeIsAnswered: isAnsweredDiscussionFeatureSupported(
        notification.account,
      ),
    },
  );
}
