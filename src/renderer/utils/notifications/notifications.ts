import { Constants } from '../../constants';
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

  const builder = new MergeQueryBuilder(
    BatchMergedDetailsQueryTemplateFragmentDoc,
  );

  const notificationResponseNodeAlias = new Map<GitifyNotification, string>();

  let index = 0;
  for (const notification of notifications) {
    const handler = createNotificationHandler(notification);

    // Skip notifications that aren't suitable for batch merged enrichment
    if (!handler.supportsMergedQueryEnrichment) {
      continue;
    }

    const responseNodeAlias = `node${index}`;

    builder.addQueryNode('node', index, {
      owner: notification.repository.owner.login,
      name: notification.repository.name,
      number: getNumberFromUrl(notification.subject.url),
      isDiscussionNotification: notification.subject.type === 'Discussion',
      isIssueNotification: notification.subject.type === 'Issue',
      isPullRequestNotification: notification.subject.type === 'PullRequest',
    });

    notificationResponseNodeAlias.set(notification, responseNodeAlias);

    index += 1;
  }

  // Non-Query fragments were auto-added by the builder constructor

  // TODO - Extract this from the BatchMergedDetailsQueryTemplateFragmentDoc
  builder.addVariableDefs(
    '$lastComments: Int, $lastThreadedComments: Int, $lastReplies: Int, $lastReviews: Int, $firstLabels: Int, $firstClosingIssues: Int, $includeIsAnswered: Boolean!',
  );

  const mergedQuery = builder.buildQuery();

  builder
    .setVar('firstLabels', Constants.GRAPHQL_ARGS.FIRST_LABELS)
    .setVar('lastComments', Constants.GRAPHQL_ARGS.LAST_COMMENTS)
    .setVar(
      'lastThreadedComments',
      Constants.GRAPHQL_ARGS.LAST_THREADED_COMMENTS,
    )
    .setVar('lastReplies', Constants.GRAPHQL_ARGS.LAST_REPLIES)
    .setVar(
      'includeIsAnswered',
      isAnsweredDiscussionFeatureSupported(notifications[0].account),
    )
    .setVar('firstClosingIssues', Constants.GRAPHQL_ARGS.FIRST_CLOSING_ISSUES)
    .setVar('lastReviews', Constants.GRAPHQL_ARGS.LAST_REVIEWS);
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
      let targetRootAlias: string | undefined;
      targetRootAlias = notificationResponseNodeAlias.get(notification);

      let fragment: unknown;
      if (mergedData && targetRootAlias) {
        const repoData = mergedData[targetRootAlias] as Record<string, unknown>;
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
