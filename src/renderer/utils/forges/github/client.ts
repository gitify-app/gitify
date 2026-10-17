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

import {
  type OrganizationAuthorizationCondition,
  type OrganizationBlockReason,
  reportOrganizationAuthorization,
} from '../../notifications/orgAuthorization';
import { reportServerPollInterval } from '../../notifications/pollInterval';
import { getGitHubCapabilities } from './capabilities';
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
import { stripGatedSelections } from './graphql/utils';
import { createNotificationHandler } from './handlers';
import { createOctokitClient, createOctokitClientUncached } from './octokit';
import {
  type PartialGraphQLFailure,
  performGraphQLRequestString,
  performGraphQLRequestStringTolerant,
} from './request';
import { parseSsoHeader } from './sso';
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
 * List all notifications for the current user, sorted by most recently updated.
 *
 * The server-recommended minimum poll interval (`X-Poll-Interval` header) is
 * reported to the poll interval registry so the notifications query can slow
 * down when GitHub asks clients to back off.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/activity/notifications#list-notifications-for-the-authenticated-user
 */
export async function listNotificationsForAuthenticatedUser(
  account: Account,
): Promise<ListNotificationsForAuthenticatedUserResponse> {
  const settings = useSettingsStore.getState();
  const octokit = await createOctokitClient(account, 'rest');

  if (settings.fetchAllNotifications) {
    // Fetch all pages using Octokit's pagination. The SSO header rides on each
    // response, so every page is inspected and the first page carrying one
    // describes the whole listing.
    let condition: OrganizationAuthorizationCondition | null = null;

    const notifications = await octokit.paginate(
      octokit.rest.activity.listNotificationsForAuthenticatedUser,
      {
        participating: settings.participating,
        all: settings.fetchReadNotifications,
        per_page: 100,
        headers: {
          'Cache-Control': 'no-cache', // Prevent caching
        },
      },
      (response) => {
        reportServerPollInterval(account, Number(response.headers['x-poll-interval']));

        const headers = response.headers as Record<string, string | undefined>;
        condition ??= parseSsoHeader(headers['x-github-sso']);

        return response.data;
      },
    );

    reportOrganizationAuthorization(account, condition);

    return notifications;
  }

  // Single page request
  const response = await octokit.rest.activity.listNotificationsForAuthenticatedUser({
    participating: settings.participating,
    all: settings.fetchReadNotifications,
    per_page: 100,
    headers: {
      'Cache-Control': 'no-cache', // Prevent caching
    },
  });

  reportServerPollInterval(account, Number(response.headers['x-poll-interval']));

  const headers = response.headers as Record<string, string | undefined>;
  reportOrganizationAuthorization(account, parseSsoHeader(headers['x-github-sso']));

  return response.data;
}

export interface ReachableOrganizations {
  /** Logins of organizations the token can reach. */
  logins: string[];
  /** Identifiers GitHub withheld from the listing because the token is unauthorized. */
  withheldOrganizationIds: string[];
}

/** One of the user's organization memberships, with the state GitHub reports. */
export interface OrganizationMembershipRecord {
  login: string;
  state: 'active' | 'pending';
}

/**
 * List the organizations the account's token can reach, plus any organization
 * identifiers GitHub withheld from the listing.
 *
 * When this listing observes a condition it is reported to the signal registry,
 * so the organizations view has a current authorizing link. A clean listing
 * does not clear a condition observed by another fetch, because the two
 * endpoints can legitimately disagree.
 */
export async function listReachableOrganizations(
  account: Account,
): Promise<ReachableOrganizations> {
  const octokit = await createOctokitClient(account, 'rest');

  // A holder rather than a bare `let`: the condition is assigned inside the
  // pagination callback, and control-flow narrowing would otherwise treat it as
  // still-null afterwards.
  const observed: {
    condition: OrganizationAuthorizationCondition | null;
    withheldOrganizationIds: string[];
  } = { condition: null, withheldOrganizationIds: [] };

  const organizations = await octokit.paginate(
    octokit.rest.orgs.listForAuthenticatedUser,
    {
      per_page: 100,
      headers: {
        'Cache-Control': 'no-cache', // Prevent caching
      },
    },
    (response) => {
      const headers = response.headers as Record<string, string | undefined>;
      const condition = parseSsoHeader(headers['x-github-sso']);

      if (condition && !observed.condition) {
        observed.condition = condition;

        if (condition.kind === 'partial-results') {
          observed.withheldOrganizationIds = condition.organizationIds;
        }
      }

      return response.data;
    },
  );

  if (observed.condition) {
    reportOrganizationAuthorization(account, observed.condition);
  }

  return {
    logins: organizations.map((organization) => organization.login),
    withheldOrganizationIds: observed.withheldOrganizationIds,
  };
}

/**
 * List the user's organization memberships, including memberships that are not
 * yet active.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/orgs/members#list-organization-memberships-for-the-authenticated-user
 */
export async function listOrganizationMemberships(
  account: Account,
): Promise<OrganizationMembershipRecord[]> {
  const octokit = await createOctokitClient(account, 'rest');

  const memberships = await octokit.paginate(
    octokit.rest.orgs.listMembershipsForAuthenticatedUser,
    {
      per_page: 100,
      headers: {
        'Cache-Control': 'no-cache', // Prevent caching
      },
    },
  );

  return memberships.map((membership) => ({
    login: membership.organization.login,
    state: membership.state === 'pending' ? 'pending' : 'active',
  }));
}

/**
 * Resolve an organization identifier to its login.
 *
 * Best-effort: the token that could not list the organization may not be able
 * to read it either, in which case the caller reports the identifier without a
 * name rather than dropping it.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/orgs/orgs#get-an-organization
 */
export async function getOrganizationLoginById(
  account: Account,
  organizationId: string,
): Promise<string | null> {
  try {
    const octokit = await createOctokitClient(account, 'rest');
    const response = await octokit.rest.orgs.get({ org: organizationId });

    return response.data.login;
  } catch {
    return null;
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

  const query = stripGatedSelections(
    FetchDiscussionByNumberDocument.toString(),
    getGitHubCapabilities(notification.account),
  );

  return performGraphQLRequestString<FetchDiscussionByNumberQuery>(notification.account, query, {
    owner: notification.repository.owner.login,
    name: notification.repository.name,
    number: number,
    firstLabels: Constants.GRAPHQL_ARGS.FIRST_LABELS,
    lastThreadedComments: Constants.GRAPHQL_ARGS.LAST_THREADED_COMMENTS,
    lastReplies: Constants.GRAPHQL_ARGS.LAST_REPLIES,
  });
}

/**
 * Fetch GitHub Issue by Issue Number.
 */
export async function fetchIssueByNumber(
  notification: RawGitifyNotification,
): Promise<FetchIssueByNumberQuery> {
  const number = getNumberFromUrl(notification.subject.url!);

  const query = stripGatedSelections(
    FetchIssueByNumberDocument.toString(),
    getGitHubCapabilities(notification.account),
  );

  return performGraphQLRequestString<FetchIssueByNumberQuery>(notification.account, query, {
    owner: notification.repository.owner.login,
    name: notification.repository.name,
    number: number,
    firstLabels: Constants.GRAPHQL_ARGS.FIRST_LABELS,
    firstIssueFieldValues: Constants.GRAPHQL_ARGS.FIRST_ISSUE_FIELD_VALUES,
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

  const query = stripGatedSelections(
    FetchPullRequestByNumberDocument.toString(),
    getGitHubCapabilities(notification.account),
  );

  return performGraphQLRequestString<FetchPullRequestByNumberQuery>(notification.account, query, {
    owner: notification.repository.owner.login,
    name: notification.repository.name,
    number: number,
    firstClosingIssues: Constants.GRAPHQL_ARGS.FIRST_CLOSING_ISSUES,
    firstLabels: Constants.GRAPHQL_ARGS.FIRST_LABELS,
    lastComments: Constants.GRAPHQL_ARGS.LAST_COMMENTS,
    lastReviews: Constants.GRAPHQL_ARGS.LAST_REVIEWS,
    firstReviewThreads: Constants.GRAPHQL_ARGS.FIRST_REVIEW_THREADS,
  });
}

/**
 * Per-organization failures observed while fetching notification details.
 *
 * These are the blocks GitHub reports per field (SAML enforcement, OAuth app
 * access restrictions) once the partial response is read instead of discarded.
 */
export interface NotificationDetailFailures {
  /** Organizations observed blocking a request, keyed by login with the reason. */
  blocks: Map<string, OrganizationBlockReason>;
  /** Whether a failure arrived that could not be attributed to an organization. */
  hasUnattributedBlock: boolean;
}

/** The resolved details plus whatever blocks the response reported. */
export interface NotificationDetailResults {
  details: Map<RawGitifyNotification, FetchMergedDetailsTemplateQuery['repository']>;
  failures: NotificationDetailFailures;
}

function noDetailFailures(): NotificationDetailFailures {
  return { blocks: new Map(), hasUnattributedBlock: false };
}

/**
 * Fetch notification details for supported types (ie: Discussions, Issues and Pull Requests).

 * This significantly reduces the amount of API calls by performing a building a merged GraphQL query,
 * making the most efficient use of the available GitHub API quota limits.
 *
 * The request tolerates a partial response: when an organization blocks access,
 * the returned data is still used and each failure is attributed back to the
 * notification (and therefore the organization) through the query alias.
 */
export async function fetchNotificationDetailsForList(
  notifications: RawGitifyNotification[],
): Promise<NotificationDetailResults> {
  const results = new Map<RawGitifyNotification, FetchMergedDetailsTemplateQuery['repository']>();

  if (!notifications.length) {
    return { details: results, failures: noDetailFailures() };
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
    return { details: results, failures: noDetailFailures() };
  }

  builder.setSharedVariables({
    firstClosingIssues: Constants.GRAPHQL_ARGS.FIRST_CLOSING_ISSUES,
    firstLabels: Constants.GRAPHQL_ARGS.FIRST_LABELS,
    firstIssueFieldValues: Constants.GRAPHQL_ARGS.FIRST_ISSUE_FIELD_VALUES,
    lastComments: Constants.GRAPHQL_ARGS.LAST_COMMENTS,
    lastThreadedComments: Constants.GRAPHQL_ARGS.LAST_THREADED_COMMENTS,
    lastReplies: Constants.GRAPHQL_ARGS.LAST_REPLIES,
    lastReviews: Constants.GRAPHQL_ARGS.LAST_REVIEWS,
    firstReviewThreads: Constants.GRAPHQL_ARGS.FIRST_REVIEW_THREADS,
  });

  const query = stripGatedSelections(
    builder.getGraphQLQuery(),
    getGitHubCapabilities(notifications[0].account),
  );
  const variables = builder.getGraphQLVariables();

  const { data, failures } = await performGraphQLRequestStringTolerant<Record<string, unknown>>(
    notifications[0].account,
    query,
    variables,
  );

  for (const [alias, notification] of aliasToNotification) {
    const repoData = data?.[alias] as Record<string, unknown> | undefined;
    if (!repoData) {
      continue; // Skip if no data for this alias
    }
    const fragment = Object.values(repoData)[0] as FetchMergedDetailsTemplateQuery['repository'];
    results.set(notification, fragment);
  }

  return { details: results, failures: attributeFailures(failures, aliasToNotification) };
}

/**
 * Map each reported failure back to the notification it belongs to through the
 * query alias, and so to the organization that owns the repository. A failure
 * that cannot be tied to a notification is recorded without naming an
 * organization rather than being dropped.
 */
function attributeFailures(
  failures: PartialGraphQLFailure[],
  aliasToNotification: Map<string, RawGitifyNotification>,
): NotificationDetailFailures {
  const blocks = new Map<string, OrganizationBlockReason>();
  let hasUnattributedBlock = false;

  for (const failure of failures) {
    const reason = blockReason(failure);
    const alias = typeof failure.path?.[0] === 'string' ? failure.path[0] : undefined;
    const organizationLogin = alias
      ? aliasToNotification.get(alias)?.repository.owner.login
      : undefined;

    if (organizationLogin) {
      blocks.set(organizationLogin, reason);
    } else {
      hasUnattributedBlock = true;
    }
  }

  return { blocks, hasUnattributedBlock };
}

/**
 * Read why GitHub blocked a request from the error it returned. SAML
 * enforcement and OAuth app access restrictions are different problems with
 * different remedies, so they are kept apart; anything unrecognised is reported
 * without guessing.
 */
function blockReason(failure: PartialGraphQLFailure): OrganizationBlockReason {
  if (failure.extensions?.saml_failure === true || failure.message.includes('SAML enforcement')) {
    return 'saml';
  }

  if (failure.message.includes('OAuth App access restrictions')) {
    return 'app-restriction';
  }

  return 'unknown';
}
