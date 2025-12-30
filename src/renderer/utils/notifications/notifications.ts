import type {
  AccountNotifications,
  GitifyNotification,
  GitifyState,
  GitifySubject,
  SettingsState,
} from '../../types';
import {
  fetchMergedQueryDetails,
  listNotificationsForAuthenticatedUser,
} from '../api/client';
import { determineFailureType } from '../api/errors';
import { BatchMergedDetailsQueryTemplateFragmentDoc } from '../api/graphql/generated/graphql';
import { MergeQueryBuilder } from '../api/graphql/MergeQueryBuilder';
import {
  aliasRootAndKeyVariables,
  extractNonQueryFragments,
  extractQueryFragments,
} from '../api/graphql/utils';
import { transformNotification } from '../api/transform';
import { getNumberFromUrl } from '../api/utils';
import { isAnsweredDiscussionFeatureSupported } from '../features';
import { rendererLogError, rendererLogWarn } from '../logger';
import {
  filterBaseNotifications,
  filterDetailedNotifications,
} from './filters/filter';
import { getFlattenedNotificationsByRepo } from './group';
import { createNotificationHandler } from './handlers';

/**
 * Get the count of notifications across all accounts.
 *
 * @param accountNotifications - The account notifications to check.
 * @returns The count of all notifications.
 */
export function getNotificationCount(
  accountNotifications: AccountNotifications[],
) {
  return accountNotifications.reduce(
    (sum, account) => sum + account.notifications.length,
    0,
  );
}

/**
 * Get the count of notifications across all accounts.
 *
 * @param accountNotifications - The account notifications to check.
 * @returns The count of unread notifications.
 */
export function getUnreadNotificationCount(
  accountNotifications: AccountNotifications[],
) {
  return accountNotifications.reduce(
    (sum, account) =>
      sum + account.notifications.filter((n) => n.unread === true).length,
    0,
  );
}

function getNotifications(state: GitifyState) {
  return state.auth.accounts.map((account) => {
    return {
      account,
      notifications: listNotificationsForAuthenticatedUser(
        account,
        state.settings,
      ),
    };
  });
}

/**
 * Get all notifications for all accounts.
 *
 * @param state - The Gitify state.
 * @returns A promise that resolves to an array of account notifications.
 */
export async function getAllNotifications(
  state: GitifyState,
): Promise<AccountNotifications[]> {
  const accountNotifications: AccountNotifications[] = await Promise.all(
    getNotifications(state)
      .filter((response) => !!response)
      .map(async (accountNotifications) => {
        try {
          const rawNotifications = (await accountNotifications.notifications)
            .data;
          let notifications = rawNotifications.map((raw) =>
            transformNotification(raw, accountNotifications.account),
          );

          notifications = filterBaseNotifications(
            notifications,
            state.settings,
          );

          notifications = await enrichNotifications(
            notifications,
            state.settings,
          );

          notifications = filterDetailedNotifications(
            notifications,
            state.settings,
          );

          return {
            account: accountNotifications.account,
            notifications: notifications,
            error: null,
          };
        } catch (err) {
          rendererLogError(
            'getAllNotifications',
            'error occurred while fetching account notifications',
            err,
          );

          return {
            account: accountNotifications.account,
            notifications: [],
            error: determineFailureType(err),
          };
        }
      }),
  );

  // Set the order property for the notifications
  stabilizeNotificationsOrder(accountNotifications, state.settings);

  return accountNotifications;
}

export async function enrichNotifications(
  notifications: GitifyNotification[],
  settings: SettingsState,
): Promise<GitifyNotification[]> {
  if (!settings.detailedNotifications) {
    return notifications;
  }

  const builder = new MergeQueryBuilder();
  const targets: Array<{
    rootAlias: string;
    notification: GitifyNotification;
    handler: ReturnType<typeof createNotificationHandler>;
  }> = [];

  let index = 0;
  for (const notification of notifications) {
    const handler = createNotificationHandler(notification);
    const mergeType = handler.mergeQueryNodeResponseType;

    // Skip notification types that aren't suitable for batch merged  enrichment
    if (!mergeType) {
      continue;
    }

    /**
     * To construct the graphql query, we need to
     * 1 - extract the indexed arguments and rename them
     * 2 - initialize the indexed argument values
     * 3 - extract the global arguments
     * 4 - initialize the global argument values
     * 5 - construct the merged query using the utility helper
     * 6 - map the response to the correct handler mergeType before parsing into handler enrich
     **/

    const org = notification.repository.owner.login;
    const repo = notification.repository.name;
    const number = getNumberFromUrl(notification.subject.url);
    const isNotificationDiscussion = notification.subject.type === 'Discussion';
    const isNotificationIssue = notification.subject.type === 'Issue';
    const isNotificationPullRequest =
      notification.subject.type === 'PullRequest';

    const rootAlias = `node${index}`;

    const queryFragmentBody = extractQueryFragments(
      BatchMergedDetailsQueryTemplateFragmentDoc,
    )[0].inner;

    const queryFragment = aliasRootAndKeyVariables(
      rootAlias,
      index,
      queryFragmentBody,
    );
    builder.addSelection(queryFragment);

    // TODO - Extract this from the BatchMergedDetailsQueryTemplateFragmentDoc
    builder.addVariableDefs(
      `$owner${index}: String!, $name${index}: String!, $number${index}: Int!, $isDiscussionNotification${index}: Boolean!, $isIssueNotification${index}: Boolean!, $isPullRequestNotification${index}: Boolean!`,
    );
    builder
      .setVar(`owner${index}`, org)
      .setVar(`name${index}`, repo)
      .setVar(`number${index}`, number)
      .setVar(`isDiscussionNotification${index}`, isNotificationDiscussion)
      .setVar(`isIssueNotification${index}`, isNotificationIssue)
      .setVar(`isPullRequestNotification${index}`, isNotificationPullRequest);

    targets.push({ rootAlias, notification, handler });

    index += 1;
  }

  const nonQueryFragments = extractNonQueryFragments(
    BatchMergedDetailsQueryTemplateFragmentDoc,
  );
  builder.addFragments(nonQueryFragments);

  // TODO - Extract this from the BatchMergedDetailsQueryTemplateFragmentDoc
  builder.addVariableDefs(
    '$lastComments: Int, $lastThreadedComments: Int, $lastReplies: Int, $lastReviews: Int, $firstLabels: Int, $firstClosingIssues: Int, $includeIsAnswered: Boolean!',
  );

  const mergedQuery = builder.buildQuery();

  // TODO - consolidate static args into constants, refactor below and other graphql query variables in api/clients to be consistent
  builder
    .setVar('firstLabels', 100)
    .setVar('lastComments', 1)
    .setVar('lastThreadedComments', 10)
    .setVar('lastReplies', 10)
    .setVar(
      'includeIsAnswered',
      isAnsweredDiscussionFeatureSupported(notifications[0].account),
    )
    .setVar('firstClosingIssues', 100)
    .setVar('lastReviews', 100);
  const queryVariables = builder.getVariables();

  let mergedData: Record<string, unknown> | null = null;

  try {
    const response = await fetchMergedQueryDetails(
      notifications[0],
      mergedQuery,
      queryVariables,
    );

    mergedData = response.data;
  } catch (err) {
    rendererLogError(
      'enrichNotifications',
      'Failed to fetch merged notification details',
      err,
    );
  }

  const enrichedNotifications = await Promise.all(
    notifications.map(async (notification: GitifyNotification) => {
      const target = targets.find((item) => item.notification === notification);

      // TODO - simplify the below where possible
      let fragment: unknown;
      if (mergedData && target) {
        const repoData = mergedData[target.rootAlias] as Record<
          string,
          unknown
        >;
        if (repoData) {
          for (const value of Object.values(repoData)) {
            if (value !== undefined) {
              fragment = value;
              break;
            }
          }
        }
      }

      return enrichNotification(notification, settings, fragment);
    }),
  );
  return enrichedNotifications;
}

/**
 * Enrich a notification with additional details.
 *
 * @param notification - The notification to enrich.
 * @param settings - The settings to use for enrichment.
 * @returns The enriched notification.
 */
export async function enrichNotification(
  notification: GitifyNotification,
  settings: SettingsState,
  fetchedData?: unknown,
): Promise<GitifyNotification> {
  let additionalSubjectDetails: Partial<GitifySubject> = {};

  try {
    const handler = createNotificationHandler(notification);
    additionalSubjectDetails = await handler.enrich(
      notification,
      settings,
      fetchedData,
    );
  } catch (err) {
    rendererLogError(
      'enrichNotification',
      'failed to enrich notification details for',
      err,
      notification,
    );

    rendererLogWarn(
      'enrichNotification',
      'Continuing with base notification details',
    );
  }

  return {
    ...notification,
    subject: {
      ...notification.subject,
      ...additionalSubjectDetails,
    },
  };
}

/**
 * Assign an order property to each notification to stabilize how they are displayed
 * during notification interaction events (mark as read, mark as done, etc.)
 *
 * @param accountNotifications
 * @param settings
 */
export function stabilizeNotificationsOrder(
  accountNotifications: AccountNotifications[],
  settings: SettingsState,
) {
  let orderIndex = 0;

  for (const account of accountNotifications) {
    const flattenedNotifications = getFlattenedNotificationsByRepo(
      account.notifications,
      settings,
    );

    for (const notification of flattenedNotifications) {
      notification.order = orderIndex++;
    }
  }
}
