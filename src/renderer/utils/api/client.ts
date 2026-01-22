import { Constants } from '../../constants';

import type {
  Account,
  GitifyNotification,
  Hostname,
  Link,
  SettingsState,
  Token,
} from '../../types';
import type { GitHubGraphQLResponse } from './graphql/types';
import type {
  GetCommitCommentResponse,
  GetCommitResponse,
  GetReleaseResponse,
  GitHubHtmlUrlResponse,
  HeadNotificationsResponse,
  IgnoreNotificationThreadSubscriptionResponse,
  ListNotificationsForAuthenticatedUserResponse,
  MarkNotificationThreadAsDoneResponse,
  MarkNotificationThreadAsReadResponse,
} from './types';

import { isAnsweredDiscussionFeatureSupported } from '../features';
import { createNotificationHandler } from '../notifications/handlers';
import {
  FetchAuthenticatedUserDetailsDocument,
  type FetchAuthenticatedUserDetailsQuery,
  FetchDiscussionByNumberDocument,
  type FetchDiscussionByNumberQuery,
  FetchIssueByNumberDocument,
  type FetchIssueByNumberQuery,
  type FetchMergedDetailsTemplateQuery,
  FetchPullRequestByNumberDocument,
  type FetchPullRequestByNumberQuery,
} from './graphql/generated/graphql';
import { MergeQueryBuilder } from './graphql/MergeQueryBuilder';
import { createOctokitClient } from './octokit';
import { performGraphQLRequest, performGraphQLRequestString } from './request';
import { getGitHubGraphQLUrl, getNumberFromUrl } from './utils';

/**
 * Perform a HEAD operation, used to validate that connectivity is established.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/activity/notifications
 */
export async function headNotifications(
  hostname: Hostname,
  token: Token,
): Promise<HeadNotificationsResponse> {
  const octokit = await createOctokitClient(hostname, token);

  await octokit.rest.activity.listNotificationsForAuthenticatedUser({
    per_page: 1,
  });
}

/**
 * List all notifications for the current user, sorted by most recently updated.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/activity/notifications#list-notifications-for-the-authenticated-user
 */
export async function listNotificationsForAuthenticatedUser(
  account: Account,
  settings: SettingsState,
): Promise<ListNotificationsForAuthenticatedUserResponse> {
  const octokit = await createOctokitClient(account.hostname, account.token);

  if (settings.fetchAllNotifications) {
    // Fetch all pages using Octokit's pagination
    return await octokit.paginate(
      octokit.rest.activity.listNotificationsForAuthenticatedUser,
      {
        participating: settings.participating,
        all: settings.fetchReadNotifications,
        per_page: 100,
        headers: {
          'If-None-Match': '', // Prevent caching
        },
      },
    );
  }

  // Single page request
  const response =
    await octokit.rest.activity.listNotificationsForAuthenticatedUser({
      participating: settings.participating,
      all: settings.fetchReadNotifications,
      per_page: 100,
      headers: {
        'If-None-Match': '', // Prevent caching
      },
    });

  return response.data;
}

/**
 * Marks a thread as "read." Marking a thread as "read" is equivalent to
 * clicking a notification in your notification inbox on GitHub.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/activity/notifications#mark-a-thread-as-read
 */
export async function markNotificationThreadAsRead(
  threadId: string,
  hostname: Hostname,
  token: Token,
): Promise<MarkNotificationThreadAsReadResponse> {
  const octokit = await createOctokitClient(hostname, token);

  const response = await octokit.rest.activity.markThreadAsRead({
    thread_id: Number(threadId),
  });

  return response.data;
}

/**
 * Marks a thread as "done." Marking a thread as "done" is equivalent to marking a
 * notification in your notification inbox on GitHub as done.
 *
 * NOTE: This was added to GitHub Enterprise Server in version 3.13 or later.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/activity/notifications#mark-a-thread-as-done
 */
export async function markNotificationThreadAsDone(
  threadId: string,
  hostname: Hostname,
  token: Token,
): Promise<MarkNotificationThreadAsDoneResponse> {
  const octokit = await createOctokitClient(hostname, token);

  const response = await octokit.rest.activity.markThreadAsDone({
    thread_id: Number(threadId),
  });

  return response.data;
}

/**
 * Ignore future notifications for threads until you comment on the thread or get a `@mention`.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/activity/notifications#delete-a-thread-subscription
 */
export async function ignoreNotificationThreadSubscription(
  threadId: string,
  hostname: Hostname,
  token: Token,
): Promise<IgnoreNotificationThreadSubscriptionResponse> {
  const octokit = await createOctokitClient(hostname, token);

  const response = await octokit.rest.activity.setThreadSubscription({
    thread_id: Number(threadId),
    ignored: true,
  });

  return response.data;
}

/**
 * Returns the contents of a single commit reference.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/commits/commits#get-a-commit
 */
export async function getCommit(
  url: Link,
  token: Token,
): Promise<GetCommitResponse> {
  // Parse URL: /repos/{owner}/{repo}/commits/{ref}
  const urlObj = new URL(url);
  const match = urlObj.pathname.match(
    /^\/repos\/(?<owner>[^/]+)\/(?<repo>[^/]+)\/commits\/(?<ref>.+)$/,
  );

  if (!match?.groups) {
    throw new Error(`Invalid commit URL format: ${url}`);
  }

  const { owner, repo, ref } = match.groups;
  const hostname = urlObj.hostname as Hostname;

  const octokit = await createOctokitClient(hostname, token);

  const response = await octokit.rest.repos.getCommit({
    owner,
    repo,
    ref,
  });

  return response.data;
}

/**
 * Gets a specified commit comment.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/commits/comments#get-a-commit-comment
 */
export async function getCommitComment(
  url: Link,
  token: Token,
): Promise<GetCommitCommentResponse> {
  // Parse URL: /repos/{owner}/{repo}/comments/{comment_id}
  const urlObj = new URL(url);
  const match = urlObj.pathname.match(
    /^\/repos\/(?<owner>[^/]+)\/(?<repo>[^/]+)\/comments\/(?<commentId>\d+)$/,
  );

  if (!match?.groups) {
    throw new Error(`Invalid commit comment URL format: ${url}`);
  }

  const { owner, repo, commentId } = match.groups;
  const hostname = urlObj.hostname as Hostname;

  const octokit = await createOctokitClient(hostname, token);

  const response = await octokit.rest.repos.getCommitComment({
    owner: owner,
    repo: repo,
    comment_id: Number(commentId),
  });

  return response.data;
}

/**
 * Gets a public release with the specified release ID.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/releases/releases#get-a-release
 */
export async function getRelease(
  url: Link,
  token: Token,
): Promise<GetReleaseResponse> {
  // Parse URL: /repos/{owner}/{repo}/releases/{release_id}
  const urlObj = new URL(url);
  const match = urlObj.pathname.match(
    /^\/repos\/(?<owner>[^/]+)\/(?<repo>[^/]+)\/releases\/(?<releaseId>\d+)$/,
  );

  if (!match?.groups) {
    throw new Error(`Invalid release URL format: ${url}`);
  }

  const { owner, repo, releaseId } = match.groups;
  const hostname = urlObj.hostname as Hostname;

  const octokit = await createOctokitClient(hostname, token);

  const response = await octokit.rest.repos.getRelease({
    owner: owner,
    repo: repo,
    release_id: Number(releaseId),
  });

  return response.data;
}

/**
 * Get the `html_url` from the GitHub response
 */
export async function getHtmlUrl(
  url: Link,
  token: Token,
): Promise<GitHubHtmlUrlResponse> {
  // Extract hostname from URL to determine which Octokit client to use
  const urlObj = new URL(url);
  const hostname = urlObj.hostname as Hostname;

  const octokit = await createOctokitClient(hostname, token);

  // Perform a generic GET request using Octokit's request method
  const response = await octokit.request('GET {+url}', {
    url: url,
  });

  return response.data as GitHubHtmlUrlResponse;
}

/**
 * Fetch details of the currently authenticated GitHub user.
 */
export async function fetchAuthenticatedUserDetails(
  hostname: Hostname,
  token: Token,
): Promise<GitHubGraphQLResponse<FetchAuthenticatedUserDetailsQuery>> {
  const url = getGitHubGraphQLUrl(hostname);

  return performGraphQLRequest(
    url.toString() as Link,
    token,
    FetchAuthenticatedUserDetailsDocument,
  );
}

/**
 * Fetch GitHub Discussion by Discussion Number.
 */
export async function fetchDiscussionByNumber(
  notification: GitifyNotification,
): Promise<GitHubGraphQLResponse<FetchDiscussionByNumberQuery>> {
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
      firstLabels: Constants.GRAPHQL_ARGS.FIRST_LABELS,
      lastThreadedComments: Constants.GRAPHQL_ARGS.LAST_THREADED_COMMENTS,
      lastReplies: Constants.GRAPHQL_ARGS.LAST_REPLIES,
      includeIsAnswered: isAnsweredDiscussionFeatureSupported(
        notification.account,
      ),
    },
  );
}

/**
 * Fetch GitHub Issue by Issue Number.
 */
export async function fetchIssueByNumber(
  notification: GitifyNotification,
): Promise<GitHubGraphQLResponse<FetchIssueByNumberQuery>> {
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
      firstLabels: Constants.GRAPHQL_ARGS.FIRST_LABELS,
      lastComments: Constants.GRAPHQL_ARGS.LAST_COMMENTS,
    },
  );
}

/**
 * Fetch GitHub Pull Request by PR Number.
 */
export async function fetchPullByNumber(
  notification: GitifyNotification,
): Promise<GitHubGraphQLResponse<FetchPullRequestByNumberQuery>> {
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
      firstClosingIssues: Constants.GRAPHQL_ARGS.FIRST_CLOSING_ISSUES,
      firstLabels: Constants.GRAPHQL_ARGS.FIRST_LABELS,
      lastComments: Constants.GRAPHQL_ARGS.LAST_COMMENTS,
      lastReviews: Constants.GRAPHQL_ARGS.LAST_REVIEWS,
    },
  );
} /**
 * Fetch notification details for supported types (ie: Discussions, Issues and Pull Requests).

 * This significantly reduces the amount of API calls by performing a building a merged GraphQL query,
 * making the most efficient use of the available GitHub API quota limits.
 */
export async function fetchNotificationDetailsForList(
  notifications: GitifyNotification[],
): Promise<
  Map<GitifyNotification, FetchMergedDetailsTemplateQuery['repository']>
> {
  const results = new Map<
    GitifyNotification,
    FetchMergedDetailsTemplateQuery['repository']
  >();

  if (!notifications.length) {
    return results;
  }

  // Build merged query using the builder
  const builder = new MergeQueryBuilder();
  const aliasToNotification = new Map<string, GitifyNotification>();
  let hasSupportedNotification = false;

  for (const notification of notifications) {
    const handler = createNotificationHandler(notification);
    if (!handler.supportsMergedQueryEnrichment) {
      continue;
    }

    hasSupportedNotification = true;

    const alias = builder.addNode({
      owner: notification.repository.owner.login,
      name: notification.repository.name,
      number: getNumberFromUrl(notification.subject.url),
      isDiscussionNotification: notification.subject.type === 'Discussion',
      isIssueNotification: notification.subject.type === 'Issue',
      isPullRequestNotification: notification.subject.type === 'PullRequest',
    });

    aliasToNotification.set(alias, notification);
  }

  if (!hasSupportedNotification) {
    return results;
  }

  builder.setSharedVariables({
    includeIsAnswered: isAnsweredDiscussionFeatureSupported(
      notifications[0].account,
    ),
    firstClosingIssues: Constants.GRAPHQL_ARGS.FIRST_CLOSING_ISSUES,
    firstLabels: Constants.GRAPHQL_ARGS.FIRST_LABELS,
    lastComments: Constants.GRAPHQL_ARGS.LAST_COMMENTS,
    lastThreadedComments: Constants.GRAPHQL_ARGS.LAST_THREADED_COMMENTS,
    lastReplies: Constants.GRAPHQL_ARGS.LAST_REPLIES,
    lastReviews: Constants.GRAPHQL_ARGS.LAST_REVIEWS,
  });

  const query = builder.getGraphQLQuery();
  const variables = builder.getGraphQLVariables();

  const url = getGitHubGraphQLUrl(notifications[0].account.hostname);

  const response = await performGraphQLRequestString(
    url.toString() as Link,
    notifications[0].account.token,
    query,
    variables,
  );

  const data = response.data as Record<string, unknown> | undefined;
  if (data) {
    for (const [alias, notification] of aliasToNotification) {
      const repoData = data[alias] as Record<string, unknown> | undefined;
      if (repoData) {
        const fragment = Object.values(
          repoData,
        )[0] as FetchMergedDetailsTemplateQuery['repository'];
        results.set(notification, fragment);
      }
    }
  }

  return results;
}
