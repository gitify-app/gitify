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
import { formatAsGitHubSearchSyntax } from './graphql/utils';
import { apiRequestAuth } from './request';
import { getGitHubAPIBaseUrl, getGitHubGraphQLUrl } from './utils';

/**
 * Get the authenticated user
 *
 * Endpoint documentation: https://docs.github.com/en/rest/users/users#get-the-authenticated-user
 */
export function getAuthenticatedUser(
  account: Account,
): AxiosPromise<UserDetails> {
  const url = getGitHubAPIBaseUrl(account.hostname);
  url.pathname += 'user';

  return apiRequestAuth(url.toString() as Link, 'GET', account);
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

  const tmpAccount: Account = {
    hostname,
    token,
  } as Partial<Account> as Account;

  return apiRequestAuth(url.toString() as Link, 'HEAD', tmpAccount);
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
    account,
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
  account: Account,
  threadId: string,
): AxiosPromise<void> {
  const url = getGitHubAPIBaseUrl(account.hostname);
  url.pathname += `notifications/threads/${threadId}`;

  return apiRequestAuth(url.toString() as Link, 'PATCH', account, {}, false);
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
  account: Account,
  threadId: string,
): AxiosPromise<void> {
  const url = getGitHubAPIBaseUrl(account.hostname);
  url.pathname += `notifications/threads/${threadId}`;

  return apiRequestAuth(url.toString() as Link, 'DELETE', account, {}, false);
}

/**
 * Ignore future notifications for threads until you comment on the thread or get a `@mention`.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/activity/notifications#delete-a-thread-subscription
 */
export function ignoreNotificationThreadSubscription(
  account: Account,
  threadId: string,
): AxiosPromise<NotificationThreadSubscription> {
  const url = getGitHubAPIBaseUrl(account.hostname);
  url.pathname += `notifications/threads/${threadId}/subscription`;

  return apiRequestAuth(
    url.toString() as Link,
    'PUT',
    account,
    {
      ignored: true,
    },
    false,
  );
}

/**
 * Returns the contents of a single commit reference.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/commits/commits#get-a-commit
 */
export function getCommit(account: Account, url: Link): AxiosPromise<Commit> {
  return apiRequestAuth(url, 'GET', account, {}, false);
}

/**
 * Gets a specified commit comment.
 * 
 * Endpoint documentation: https://docs.github.com/en/rest/commits/comments#get-a-commit-comment

 */
export function getCommitComment(
  account: Account,
  url: Link,
): AxiosPromise<CommitComment> {
  return apiRequestAuth(url, 'GET', account, {}, false);
}

/**
 * Get details of an issue.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/issues/issues#get-an-issue
 */
export function getIssue(account: Account, url: Link): AxiosPromise<Issue> {
  return apiRequestAuth(url, 'GET', account, {}, false);
}

/**
 * Get comments on issues and pull requests.
 * Every pull request is an issue, but not every issue is a pull request.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/issues/comments#get-an-issue-comment
 */
export function getIssueOrPullRequestComment(
  account: Account,
  url: Link,
): AxiosPromise<IssueOrPullRequestComment> {
  return apiRequestAuth(url, 'GET', account, {}, false);
}

/**
 * Get details of a pull request.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/pulls/pulls#get-a-pull-request
 */
export function getPullRequest(
  account: Account,
  url: Link,
): AxiosPromise<PullRequest> {
  return apiRequestAuth(url, 'GET', account, {}, false);
}

/**
 * Lists all reviews for a specified pull request. The list of reviews returns in chronological order.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/pulls/reviews#list-reviews-for-a-pull-request
 */
export function getPullRequestReviews(
  account: Account,
  url: Link,
): AxiosPromise<PullRequestReview[]> {
  return apiRequestAuth(url, 'GET', account, {}, false);
}

/**
 * Gets a public release with the specified release ID.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/releases/releases#get-a-release
 */
export function getRelease(account: Account, url: Link): AxiosPromise<Release> {
  return apiRequestAuth(url, 'GET', account);
}

/**
 * Get the `html_url` from the GitHub response
 */
export async function getHtmlUrl(account: Account, url: Link): Promise<string> {
  try {
    const response = (await apiRequestAuth(url, 'GET', account, {}, false))
      .data;
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
    notification.account,
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
    false,
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
