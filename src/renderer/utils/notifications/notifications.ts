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
import { BatchMergedDetailsQueryFragmentDoc } from '../api/graphql/generated/graphql';
import {
  aliasRootAndKeyVariables,
  composeMergedQuery,
  getQueryFragmentBody,
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

  const selections: string[] = [];
  const variableDefinitions: string[] = [];
  const variableValues: Record<string, string | number | boolean> = {};
  const fragments = new Map<string, string>();
  const targets: Array<{
    alias: string;
    notification: GitifyNotification;
    handler: ReturnType<typeof createNotificationHandler>;
  }> = [];

  let index = 0;
  for (const notification of notifications) {
    const handler = createNotificationHandler(notification);
    const config = handler.mergeQueryNodeResponseType;

    if (!config) {
      continue;
    }

    // Skip notifications without a URL (can't extract number)
    if (!notification.subject.url) {
      continue;
    }

    const org = notification.repository.owner.login;
    const repo = notification.repository.name;
    const number = getNumberFromUrl(notification.subject.url);
    const isNotificationDiscussion = notification.subject.type === 'Discussion';
    const isNotificationIssue = notification.subject.type === 'Issue';
    const isNotificationPullRequest =
      notification.subject.type === 'PullRequest';

    const alias = `node${index}`;
    const queryFragmentBody = getQueryFragmentBody(
      BatchMergedDetailsQueryFragmentDoc,
    );
    const queryFragment = aliasRootAndKeyVariables(queryFragmentBody, index);
    if (!queryFragment || queryFragment.trim().length === 0) {
      continue;
    }
    selections.push(queryFragment);
    variableDefinitions.push(
      `$owner${index}: String!, $name${index}: String!, $number${index}: Int!, $isDiscussionNotification${index}: Boolean!, $isIssueNotification${index}: Boolean!, $isPullRequestNotification${index}: Boolean!`,
    );
    variableValues[`owner${index}`] = org;
    variableValues[`name${index}`] = repo;
    variableValues[`number${index}`] = number;
    variableValues[`isDiscussionNotification${index}`] =
      isNotificationDiscussion;
    variableValues[`isIssueNotification${index}`] = isNotificationIssue;
    variableValues[`isPullRequestNotification${index}`] =
      isNotificationPullRequest;

    targets.push({ alias, notification, handler });

    index += 1;
  }

  if (selections.length === 0) {
    // No handlers with mergeQueryConfig, just enrich individually
    return Promise.all(
      notifications.map(async (notification) => {
        const handler = createNotificationHandler(notification);
        const details = await handler.enrich(notification, settings);
        return {
          ...notification,
          subject: {
            ...notification.subject,
            ...details,
          },
        };
      }),
    );
  }

  variableDefinitions.push(
    '$lastComments: Int, $lastThreadedComments: Int, $lastReplies: Int, $lastReviews: Int, $firstLabels: Int, $firstClosingIssues: Int, $includeIsAnswered: Boolean!',
  );

  const mergedQuery = composeMergedQuery(
    selections,
    fragments,
    variableDefinitions,
  );

  const queryVariables = {
    ...variableValues,
    firstLabels: 100,
    lastComments: 1,
    lastThreadedComments: 10,
    lastReplies: 10,
    includeIsAnswered: isAnsweredDiscussionFeatureSupported(
      notifications[0].account,
    ),
    firstClosingIssues: 100,
    lastReviews: 100,
  };

  let mergedData: Record<string, unknown> | null = null;

  try {
    const response = await fetchMergedQueryDetails(
      notifications[0],
      mergedQuery,
      queryVariables,
    );

    mergedData =
      (response.data as { data?: Record<string, unknown> })?.data ?? null;
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
      const handler =
        target?.handler ?? createNotificationHandler(notification);

      let fragment: unknown;
      if (mergedData && target) {
        const repoData = mergedData[target.alias] as
          | Record<string, unknown>
          | undefined;
        if (repoData) {
          for (const value of Object.values(repoData)) {
            if (value !== undefined) {
              fragment = value;
              break;
            }
          }
        }
      }

      const details = await handler.enrich(notification, settings, fragment);
      return {
        ...notification,
        subject: {
          ...notification.subject,
          ...details,
        },
      };
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
): Promise<GitifyNotification> {
  let additionalSubjectDetails: Partial<GitifySubject> = {};

  try {
    const handler = createNotificationHandler(notification);
    additionalSubjectDetails = await handler.enrich(notification, settings);
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
