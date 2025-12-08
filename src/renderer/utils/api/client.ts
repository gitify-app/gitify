import type { AxiosPromise } from 'axios';
import { print } from 'graphql/language/printer';

import type {
  Account,
  Hostname,
  Link,
  SettingsState,
  Token,
} from '../../types';
import type {
  Commit,
  CommitComment,
  Discussion,
  GraphQLMergeQueue,
  GraphQLSearch,
  Issue,
  IssueOrPullRequestComment,
  Notification,
  NotificationThreadSubscription,
  PullRequest,
  PullRequestReview,
  Release,
  UserDetails,
} from '../../typesGitHub';
import { isAnsweredDiscussionFeatureSupported } from '../features';
import { rendererLogError } from '../logger';
import { QUERY_SEARCH_DISCUSSIONS } from './graphql/discussions';
import { QUERY_CHECK_MERGE_QUEUE_FOR_PR } from './graphql/pullRequests';
import { formatAsGitHubSearchSyntax } from './graphql/utils';
import { apiRequestAuth } from './request';
import { getGitHubAPIBaseUrl, getGitHubGraphQLUrl } from './utils';

/**
 * Get the authenticated user
 *
 * Endpoint documentation: https://docs.github.com/en/rest/users/users#get-the-authenticated-user
 */
export function getAuthenticatedUser(
  hostname: Hostname,
  token: Token,
): AxiosPromise<UserDetails> {
  const url = getGitHubAPIBaseUrl(hostname);
  url.pathname += 'user';

  return apiRequestAuth(url.toString() as Link, 'GET', token);
}

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
): AxiosPromise<Notification[]> {
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
export function getCommit(url: Link, token: Token): AxiosPromise<Commit> {
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
): AxiosPromise<CommitComment> {
  return apiRequestAuth(url, 'GET', token);
}

/**
 * Get details of an issue.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/issues/issues#get-an-issue
 */
export function getIssue(url: Link, token: Token): AxiosPromise<Issue> {
  return apiRequestAuth(url, 'GET', token);
}

/**
 * Get comments on issues and pull requests.
 * Every pull request is an issue, but not every issue is a pull request.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/issues/comments#get-an-issue-comment
 */
export function getIssueOrPullRequestComment(
  url: Link,
  token: Token,
): AxiosPromise<IssueOrPullRequestComment> {
  return apiRequestAuth(url, 'GET', token);
}

/**
 * Get details of a pull request.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/pulls/pulls#get-a-pull-request
 */
export function getPullRequest(
  url: Link,
  token: Token,
): AxiosPromise<PullRequest> {
  return apiRequestAuth(url, 'GET', token);
}

/**
 * Lists all reviews for a specified pull request. The list of reviews returns in chronological order.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/pulls/reviews#list-reviews-for-a-pull-request
 */
export function getPullRequestReviews(
  url: Link,
  token: Token,
): AxiosPromise<PullRequestReview[]> {
  return apiRequestAuth(url, 'GET', token);
}

/**
 * Gets a public release with the specified release ID.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/releases/releases#get-a-release
 */
export function getRelease(url: Link, token: Token): AxiosPromise<Release> {
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
 * Search for Discussions that match notification title and repository.
 *
 * Returns the latest discussion and their latest comments / replies
 *
 */
export async function searchDiscussions(
  notification: Notification,
): AxiosPromise<GraphQLSearch<Discussion>> {
  const url = getGitHubGraphQLUrl(notification.account.hostname);

  return apiRequestAuth(
    url.toString() as Link,
    'POST',
    notification.account.token,
    {
      query: print(QUERY_SEARCH_DISCUSSIONS),
      variables: {
        queryStatement: formatAsGitHubSearchSyntax(
          notification.repository.full_name,
          notification.subject.title,
        ),
        firstDiscussions: 1,
        lastComments: 100,
        lastReplies: 100,
        firstLabels: 100,
        includeIsAnswered: isAnsweredDiscussionFeatureSupported(
          notification.account,
        ),
      },
    },
  );
}

/**
 * Return the latest discussion that matches the notification title and repository.
 */
export async function getLatestDiscussion(
  notification: Notification,
): Promise<Discussion | null> {
  try {
    const response = await searchDiscussions(notification);
    return (
      response.data?.data.search.nodes.find(
        (discussion) => discussion.title === notification.subject.title,
      ) ?? null
    );
  } catch (err) {
    rendererLogError(
      'getLatestDiscussion',
      'failed to fetch latest discussion for notification',
      err,
      notification,
    );
  }
}

/**
 * Check if PR is in merge queue.
 */
export async function queryMergeQueueForPr(
  notification: Notification,
  prNumber: number,
): AxiosPromise<GraphQLMergeQueue> {
  const url = getGitHubGraphQLUrl(notification.account.hostname);

  return apiRequestAuth(
    url.toString() as Link,
    'POST',
    notification.account.token,
    {
      query: print(QUERY_CHECK_MERGE_QUEUE_FOR_PR),
      variables: {
        owner: notification.repository.owner.login,
        repository: notification.repository.name,
        prNumber: prNumber,
      },
    },
  );
}
