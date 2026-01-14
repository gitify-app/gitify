import type { AxiosPromise } from 'axios';

import { Constants } from '../../constants';
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
import {
  performAuthenticatedRESTRequest,
  performGraphQLRequest,
  performGraphQLRequestString,
} from './request';
import type {
  GitHubGraphQLResponse,
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

  return performAuthenticatedRESTRequest(url.toString() as Link, 'HEAD', token);
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
  url.searchParams.append('all', String(settings.fetchReadNotifications));

  return performAuthenticatedRESTRequest(
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

  return performAuthenticatedRESTRequest(
    url.toString() as Link,
    'PATCH',
    token,
    {},
  );
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

  return performAuthenticatedRESTRequest(
    url.toString() as Link,
    'DELETE',
    token,
    {},
  );
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

  return performAuthenticatedRESTRequest(url.toString() as Link, 'PUT', token, {
    ignored: true,
  });
}

/**
 * Returns the contents of a single commit reference.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/commits/commits#get-a-commit
 */
export function getCommit(url: Link, token: Token): AxiosPromise<RawCommit> {
  return performAuthenticatedRESTRequest(url, 'GET', token);
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
  return performAuthenticatedRESTRequest(url, 'GET', token);
}

/**
 * Gets a public release with the specified release ID.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/releases/releases#get-a-release
 */
export function getRelease(url: Link, token: Token): AxiosPromise<RawRelease> {
  return performAuthenticatedRESTRequest(url, 'GET', token);
}

/**
 * Get the `html_url` from the GitHub response
 */
export async function getHtmlUrl(url: Link, token: Token): Promise<string> {
  try {
    const response = (await performAuthenticatedRESTRequest(url, 'GET', token))
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
