import { Constants } from '../../../constants';

import useSettingsStore from '../../../stores/useSettingsStore';

import type { Account, Link, RawGitifyNotification } from '../../../types';
import type {
  GetCommitCommentResponse,
  GetCommitResponse,
  GetReleaseResponse,
  IgnoreNotificationThreadSubscriptionResponse,
  ListNotificationsForAuthenticatedUserResponse,
  MarkNotificationThreadAsDoneResponse,
  MarkNotificationThreadAsReadResponse,
} from './types';

import { getAccountUUID } from '../../auth/utils';
import { supportsAnsweredDiscussion } from './capabilities';
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
import { createNotificationHandler } from './handlers';
import { createOctokitClient, createOctokitClientUncached } from './octokit';
import { performGraphQLRequest, performGraphQLRequestString } from './request';
import { getNumberFromUrl } from './utils';

/**
 * Fetch details of the currently authenticated GitHub user.
 *
 * Always fetches fresh data without caching to ensure up-to-date user info.
 */
export async function fetchAuthenticatedUserDetails(account: Account) {
  const octokit = await createOctokitClientUncached(account, 'rest');

  return await octokit.rest.users.getAuthenticated({
    headers: {
      'Cache-Control': 'no-cache', // Prevent caching
    },
  });
}

/**
 * In-memory store of the last notifications-list response per account, used to
 * make conditional requests. When GitHub responds `304 Not Modified` (because
 * nothing has changed since the previous poll) the cached list is returned
 * without transferring or re-parsing the full body. A `304` response also does
 * not count against the primary rate limit.
 */
type NotificationsListCacheEntry = {
  etag?: string;
  lastModified?: string;
  data: ListNotificationsForAuthenticatedUserResponse;
};

const notificationsListCache = new Map<string, NotificationsListCacheEntry>();

/**
 * Clear the notifications-list conditional-request cache.
 * Exposed primarily so tests can start from a clean state.
 */
export function clearNotificationsListCache(): void {
  notificationsListCache.clear();
}

/**
 * Build the request headers for the notifications list, adding conditional
 * request validators (`If-None-Match` / `If-Modified-Since`) when a previous
 * response has been cached for the account.
 */
function buildNotificationsListHeaders(
  cached: NotificationsListCacheEntry | undefined,
): Record<string, string> {
  const headers: Record<string, string> = {
    'Cache-Control': 'no-cache', // Force revalidation rather than using a stale cached response
  };

  if (cached?.etag) {
    headers['If-None-Match'] = cached.etag;
  } else if (cached?.lastModified) {
    headers['If-Modified-Since'] = cached.lastModified;
  }

  return headers;
}

/**
 * Determine whether an error thrown by Octokit represents a `304 Not Modified`
 * response. Octokit throws a `RequestError` with `status === 304` for
 * conditional requests that hit an unchanged resource.
 */
function isNotModifiedError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    (error as { status?: number }).status === 304
  );
}

/**
 * List all notifications for the current user, sorted by most recently updated.
 *
 * Uses conditional requests so that an unchanged notifications list is returned
 * from cache on a `304 Not Modified` response instead of being re-downloaded.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/activity/notifications#list-notifications-for-the-authenticated-user
 */
export async function listNotificationsForAuthenticatedUser(
  account: Account,
): Promise<ListNotificationsForAuthenticatedUserResponse> {
  const settings = useSettingsStore.getState();
  const octokit = await createOctokitClient(account, 'rest');

  const cacheKey = getAccountUUID(account);
  const cached = notificationsListCache.get(cacheKey);
  const headers = buildNotificationsListHeaders(cached);

  try {
    if (settings.fetchAllNotifications) {
      // Fetch all pages using Octokit's pagination, capturing the validators
      // from the first page so the next poll can be made conditional.
      let captured = false;
      let etag: string | undefined;
      let lastModified: string | undefined;

      const data = await octokit.paginate(
        octokit.rest.activity.listNotificationsForAuthenticatedUser,
        {
          participating: settings.participating,
          all: settings.fetchReadNotifications,
          per_page: 100,
          headers,
        },
        (response) => {
          if (!captured) {
            captured = true;
            etag = response.headers.etag;
            lastModified = response.headers['last-modified'];
          }

          return response.data;
        },
      );

      notificationsListCache.set(cacheKey, { etag, lastModified, data });

      return data;
    }

    // Single page request
    const response = await octokit.rest.activity.listNotificationsForAuthenticatedUser({
      participating: settings.participating,
      all: settings.fetchReadNotifications,
      per_page: 100,
      headers,
    });

    notificationsListCache.set(cacheKey, {
      etag: response.headers.etag,
      lastModified: response.headers['last-modified'],
      data: response.data,
    });

    return response.data;
  } catch (error) {
    if (isNotModifiedError(error) && cached) {
      return cached.data;
    }

    throw error;
  }
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
  const octokit = await createOctokitClient(account, 'rest');

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
  const octokit = await createOctokitClient(account, 'rest');

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
  const octokit = await createOctokitClient(account, 'rest');

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
export async function getCommit(account: Account, url: Link): Promise<GetCommitResponse> {
  return followUrl<GetCommitResponse>(account, url);
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
  return followUrl<GetCommitCommentResponse>(account, url);
}

/**
 * Gets a public release with the specified release ID.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/releases/releases#get-a-release
 */
export async function getRelease(account: Account, url: Link): Promise<GetReleaseResponse> {
  return followUrl<GetReleaseResponse>(account, url);
}

/**
 * Follow GitHub Response URL
 */
async function followUrl<TResult>(account: Account, url: Link): Promise<TResult> {
  const octokit = await createOctokitClient(account, 'rest');

  // Perform a generic GET request using Octokit's request method and cast the response type
  const response = await octokit.request('GET {+url}', {
    url: url,
  });

  return response.data as TResult;
}

/**
 * Fetch GitHub Discussion by Discussion Number.
 */
export async function fetchDiscussionByNumber(
  notification: RawGitifyNotification,
): Promise<FetchDiscussionByNumberQuery> {
  const number = getNumberFromUrl(notification.subject.url!);

  return performGraphQLRequest(notification.account, FetchDiscussionByNumberDocument, {
    owner: notification.repository.owner.login,
    name: notification.repository.name,
    number: number,
    firstLabels: Constants.GRAPHQL_ARGS.FIRST_LABELS,
    lastThreadedComments: Constants.GRAPHQL_ARGS.LAST_THREADED_COMMENTS,
    lastReplies: Constants.GRAPHQL_ARGS.LAST_REPLIES,
    includeIsAnswered: supportsAnsweredDiscussion(notification.account),
  });
}

/**
 * Fetch GitHub Issue by Issue Number.
 */
export async function fetchIssueByNumber(
  notification: RawGitifyNotification,
): Promise<FetchIssueByNumberQuery> {
  const number = getNumberFromUrl(notification.subject.url!);

  return performGraphQLRequest(notification.account, FetchIssueByNumberDocument, {
    owner: notification.repository.owner.login,
    name: notification.repository.name,
    number: number,
    firstLabels: Constants.GRAPHQL_ARGS.FIRST_LABELS,
    lastComments: Constants.GRAPHQL_ARGS.LAST_COMMENTS,
  });
}

/**
 * Fetch GitHub Pull Request by PR Number.
 */
export async function fetchPullByNumber(
  notification: RawGitifyNotification,
): Promise<FetchPullRequestByNumberQuery> {
  const number = getNumberFromUrl(notification.subject.url!);

  return performGraphQLRequest(notification.account, FetchPullRequestByNumberDocument, {
    owner: notification.repository.owner.login,
    name: notification.repository.name,
    number: number,
    firstClosingIssues: Constants.GRAPHQL_ARGS.FIRST_CLOSING_ISSUES,
    firstLabels: Constants.GRAPHQL_ARGS.FIRST_LABELS,
    lastComments: Constants.GRAPHQL_ARGS.LAST_COMMENTS,
    lastReviews: Constants.GRAPHQL_ARGS.LAST_REVIEWS,
  });
} /**
 * Fetch notification details for supported types (ie: Discussions, Issues and Pull Requests).

 * This significantly reduces the amount of API calls by performing a building a merged GraphQL query,
 * making the most efficient use of the available GitHub API quota limits.
 */
export async function fetchNotificationDetailsForList(
  notifications: RawGitifyNotification[],
): Promise<Map<RawGitifyNotification, FetchMergedDetailsTemplateQuery['repository']>> {
  const results = new Map<RawGitifyNotification, FetchMergedDetailsTemplateQuery['repository']>();

  if (!notifications.length) {
    return results;
  }

  // Build merged query using the builder
  const builder = new MergeQueryBuilder();
  const aliasToNotification = new Map<string, RawGitifyNotification>();
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
      number: getNumberFromUrl(notification.subject.url!),
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
    includeIsAnswered: supportsAnsweredDiscussion(notifications[0].account),
    firstClosingIssues: Constants.GRAPHQL_ARGS.FIRST_CLOSING_ISSUES,
    firstLabels: Constants.GRAPHQL_ARGS.FIRST_LABELS,
    lastComments: Constants.GRAPHQL_ARGS.LAST_COMMENTS,
    lastThreadedComments: Constants.GRAPHQL_ARGS.LAST_THREADED_COMMENTS,
    lastReplies: Constants.GRAPHQL_ARGS.LAST_REPLIES,
    lastReviews: Constants.GRAPHQL_ARGS.LAST_REVIEWS,
  });

  const query = builder.getGraphQLQuery();
  const variables = builder.getGraphQLVariables();

  const response = await performGraphQLRequestString(notifications[0].account, query, variables);

  for (const [alias, notification] of aliasToNotification) {
    const repoData = (response as Record<string, unknown>)[alias] as
      | Record<string, unknown>
      | undefined;
    if (!repoData) {
      continue; // Skip if no data for this alias
    }
    const fragment = Object.values(repoData)[0] as FetchMergedDetailsTemplateQuery['repository'];
    results.set(notification, fragment);
  }

  return results;
}
