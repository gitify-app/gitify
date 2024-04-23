import type { AxiosPromise } from 'axios';
import type { SettingsState } from '../../types';
import type {
  Commit,
  CommitComment,
  Issue,
  IssueOrPullRequestComment,
  Notification,
  NotificationThreadSubscription,
  PullRequest,
  Release,
  RootHypermediaLinks,
  UserDetails,
} from '../../typesGitHub';
import { getGitHubAPIBaseUrl } from '../helpers';
import { apiRequestAuth } from './request';

/**
 * Get Hypermedia links to resources accessible in GitHub's REST API
 *
 * Endpoint documentation: https://docs.github.com/en/rest/meta/meta#github-api-root
 */
export function getRootHypermediaLinks(
  hostname: string,
  token: string,
): AxiosPromise<RootHypermediaLinks> {
  const baseUrl = getGitHubAPIBaseUrl(hostname);
  const url = new URL(baseUrl);
  return apiRequestAuth(url.toString(), 'GET', token);
}

/**
 * Get the authenticated user
 *
 * Endpoint documentation: https://docs.github.com/en/rest/users/users#get-the-authenticated-user
 */
export function getAuthenticatedUser(
  hostname: string,
  token: string,
): AxiosPromise<UserDetails> {
  const baseUrl = getGitHubAPIBaseUrl(hostname);
  const url = new URL(`${baseUrl}/user`);
  return apiRequestAuth(url.toString(), 'GET', token);
}

//
export function headNotifications(
  hostname: string,
  token: string,
): AxiosPromise<void> {
  const baseUrl = getGitHubAPIBaseUrl(hostname);
  const url = new URL(`${baseUrl}/notifications`);
  return apiRequestAuth(url.toString(), 'HEAD', token);
}

/**
 * List all notifications for the current user, sorted by most recently updated.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/activity/notifications#list-notifications-for-the-authenticated-user
 */
export function listNotificationsForAuthenticatedUser(
  hostname: string,
  token: string,
  settings: SettingsState,
): AxiosPromise<Notification[]> {
  const baseUrl = getGitHubAPIBaseUrl(hostname);
  const url = new URL(`${baseUrl}/notifications`);
  url.searchParams.append('participating', String(settings.participating));

  return apiRequestAuth(url.toString(), 'GET', token);
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
  const baseUrl = getGitHubAPIBaseUrl(hostname);
  const url = new URL(`${baseUrl}/notifications/threads/${threadId}`);
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
  const baseUrl = getGitHubAPIBaseUrl(hostname);
  const url = new URL(`${baseUrl}/notifications/threads/${threadId}`);
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
  const baseUrl = getGitHubAPIBaseUrl(hostname);
  const url = new URL(
    `${baseUrl}/notifications/threads/${threadId}/subscription`,
  );
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
  const baseUrl = getGitHubAPIBaseUrl(hostname);
  const url = new URL(`${baseUrl}/repos/${repoSlug}/notifications`);
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
