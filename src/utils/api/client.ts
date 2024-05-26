import type { AxiosPromise } from 'axios';
import { print } from 'graphql/language/printer';
import type { Account, SettingsState } from '../../types';
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
  hostname: string,
  token: string,
): AxiosPromise<UserDetails> {
  const url = getGitHubAPIBaseUrl(hostname);
  url.pathname += 'user';

  return apiRequestAuth(url.toString(), 'GET', token);
}

//
export function headNotifications(
  hostname: string,
  token: string,
): AxiosPromise<void> {
  const url = getGitHubAPIBaseUrl(hostname);
  url.pathname += 'notifications';

  return apiRequestAuth(url.toString(), 'HEAD', token);
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

  return apiRequestAuth(url.toString(), 'GET', account.token);
}

/**
 * Marks a thread as "read." Marking a thread as "read" is equivalent to
 * clicking a notification in your notification inbox on GitHub.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/activity/notifications#mark-a-thread-as-read
 */
export function markNotificationThreadAsRead(
  threadId: string,
  hostname: string,
  token: string,
): AxiosPromise<void> {
  const url = getGitHubAPIBaseUrl(hostname);
  url.pathname += `notifications/threads/${threadId}`;

  return apiRequestAuth(url.toString(), 'PATCH', token, {});
}

/**
 * Marks a thread as "done." Marking a thread as "done" is equivalent to marking a
 * notification in your notification inbox on GitHub as done.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/activity/notifications#mark-a-thread-as-done
 */
export function markNotificationThreadAsDone(
  threadId: string,
  hostname: string,
  token: string,
): AxiosPromise<void> {
  const url = getGitHubAPIBaseUrl(hostname);
  url.pathname += `notifications/threads/${threadId}`;

  return apiRequestAuth(url.toString(), 'DELETE', token, {});
}

/**
 * Ignore future notifications for threads until you comment on the thread or get an`@mention`.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/activity/notifications#delete-a-thread-subscription
 */
export function ignoreNotificationThreadSubscription(
  threadId: string,
  hostname: string,
  token: string,
): AxiosPromise<NotificationThreadSubscription> {
  const url = getGitHubAPIBaseUrl(hostname);
  url.pathname += `notifications/threads/${threadId}/subscription`;

  return apiRequestAuth(url.toString(), 'PUT', token, { ignored: true });
}

/**
 * Marks all notifications in a repository as "read" for the current user.
 * If the number of notifications is too large to complete in one request,
 * you will receive a 202 Accepted status and GitHub will run an asynchronous
 * process to mark notifications as "read."
 *
 * Endpoint documentation: https://docs.github.com/en/rest/activity/notifications#mark-repository-notifications-as-read
 */
export function markRepositoryNotificationsAsRead(
  repoSlug: string,
  hostname: string,
  token: string,
): AxiosPromise<void> {
  const url = getGitHubAPIBaseUrl(hostname);
  url.pathname += `repos/${repoSlug}/notifications`;

  return apiRequestAuth(url.toString(), 'PUT', token, {});
}

/**
 * Returns the contents of a single commit reference.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/commits/commits#get-a-commit
 */
export function getCommit(url: string, token: string): AxiosPromise<Commit> {
  return apiRequestAuth(url, 'GET', token);
}

/**
 * Gets a specified commit comment.
 * 
 * Endpoint documentation: https://docs.github.com/en/rest/commits/comments#get-a-commit-comment

 */
export function getCommitComment(
  url: string,
  token: string,
): AxiosPromise<CommitComment> {
  return apiRequestAuth(url, 'GET', token);
}

/**
 * Get details of an issue.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/issues/issues#get-an-issue
 */
export function getIssue(url: string, token: string): AxiosPromise<Issue> {
  return apiRequestAuth(url, 'GET', token);
}

/**
 * Get comments on issues and pull requests.
 * Every pull request is an issue, but not every issue is a pull request.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/issues/comments#get-an-issue-comment
 */
export function getIssueOrPullRequestComment(
  url: string,
  token: string,
): AxiosPromise<IssueOrPullRequestComment> {
  return apiRequestAuth(url, 'GET', token);
}

/**
 * Get details of a pull request.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/pulls/pulls#get-a-pull-request
 */
export function getPullRequest(
  url: string,
  token: string,
): AxiosPromise<PullRequest> {
  return apiRequestAuth(url, 'GET', token);
}

/**
 * Lists all reviews for a specified pull request. The list of reviews returns in chronological order.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/pulls/reviews#list-reviews-for-a-pull-request
 */
export function getPullRequestReviews(
  url: string,
  token: string,
): AxiosPromise<PullRequestReview[]> {
  return apiRequestAuth(url, 'GET', token);
}

/**
 * Gets a public release with the specified release ID.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/releases/releases#get-a-release
 */
export function getRelease(url: string, token: string): AxiosPromise<Release> {
  return apiRequestAuth(url, 'GET', token);
}

/**
 * Get the `html_url` from the GitHub response
 */
export async function getHtmlUrl(url: string, token: string): Promise<string> {
  try {
    const response = (await apiRequestAuth(url, 'GET', token)).data;
    return response.html_url;
  } catch (err) {
    console.error('Failed to get html url');
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
  return apiRequestAuth(url.toString(), 'POST', notification.account.token, {
    query: print(QUERY_SEARCH_DISCUSSIONS),
    variables: {
      queryStatement: formatAsGitHubSearchSyntax(
        notification.repository.full_name,
        notification.subject.title,
      ),
      firstDiscussions: 1,
      lastComments: 1,
      lastReplies: 1,
    },
  });
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
      response.data?.data.search.nodes.filter(
        (discussion) => discussion.title === notification.subject.title,
      )[0] ?? null
    );
  } catch (err) {}
}
