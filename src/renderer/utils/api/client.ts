import type { OctokitResponse } from '@octokit/plugin-paginate-rest/dist-types/types';

import { Constants } from '../../constants';

import type {
  Account,
  GitifyNotification,
  Link,
  SettingsState,
} from '../../types';
import type { GitHubGraphQLResponse } from './graphql/types';
import type {
  GetAuthenticatedUserResponse,
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
import {  getNumberFromUrl } from './utils';

/**
 * Perform a HEAD operation, used to validate that connectivity is established.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/activity/notifications
 */
export async function headNotifications(
  account: Account,
): Promise<HeadNotificationsResponse> {
  const octokit = await createOctokitClient(account);

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
  const octokit = await createOctokitClient(account);

    if (settings.fetchAllNotifications) {
      // Fetch all pages using Octokit's pagination
      return await octokit.paginate(
        octokit.rest.activity.listNotificationsForAuthenticatedUser,
        {
          participating: settings.participating,
          all: settings.fetchReadNotifications,
          per_page: 100,
          // TODO - is this the right way to do this
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
        // TODO - is this the right way to do this
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
  account: Account,
  threadId: string,
): Promise<MarkNotificationThreadAsReadResponse> {
  const octokit = await createOctokitClient(account);

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
  account: Account,
  threadId: string,
): Promise<MarkNotificationThreadAsDoneResponse> {
  const octokit = await createOctokitClient(account);

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
  account: Account,
  threadId: string,
): Promise<IgnoreNotificationThreadSubscriptionResponse> {
  const octokit = await createOctokitClient(account);

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
  account: Account,
  url: Link,
): Promise<GetCommitResponse> {
        return followUrl<GetCommitResponse>(account, url)

}

/**
 * Gets a specified commit comment.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/commits/comments#get-a-commit-comment
 */
export async function getCommitComment(
  account: Account,
  url: Link,
): Promise<GetCommitCommentResponse> {
      return followUrl<GetCommitCommentResponse>(account, url)

}

/**
 * Gets a public release with the specified release ID.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/releases/releases#get-a-release
 */
export async function getRelease(
  account: Account,
  url: Link,
): Promise<GetReleaseResponse> {
    return followUrl<GetReleaseResponse>(account, url)

}

/**
 * Get the `html_url` from the GitHub response
 */
export async function getHtmlUrl(
  account: Account,
  url: Link,
): Promise<GitHubHtmlUrlResponse> {
  return followUrl<GitHubHtmlUrlResponse>(account, url)
}

/**
 * Follow GitHub Response URL
 */
async function followUrl<TResult>(
  account: Account,
  url: Link,
): Promise<TResult> {
  const octokit = await createOctokitClient(account);

    // Perform a generic GET request using Octokit's request method
    const response = await octokit.request('GET {+url}', {
      url: url,
    });

    return response.data as TResult;
 
}

/**
 * Fetch details of the currently authenticated GitHub user.
 */
export async function fetchAuthenticatedUserDetails(
  account: Account,
): Promise<OctokitResponse<GetAuthenticatedUserResponse>> {
  const octokit = await createOctokitClient(account);

    const response = await octokit.rest.users.getAuthenticated();

    return response;
  
}

/**
 * Fetch GitHub Discussion by Discussion Number.
 */
export async function fetchDiscussionByNumber(
  notification: GitifyNotification,
): Promise<GitHubGraphQLResponse<FetchDiscussionByNumberQuery>> {
  const number = getNumberFromUrl(notification.subject.url);

  return performGraphQLRequest(
    notification.account,
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
  const number = getNumberFromUrl(notification.subject.url);

  return performGraphQLRequest(
    notification.account,
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
  const number = getNumberFromUrl(notification.subject.url);

  return performGraphQLRequest(
    notification.account,
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

  const response = await performGraphQLRequestString(
    notifications[0].account,
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
