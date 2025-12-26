import axios from 'axios';

import type {
  AccountNotifications,
  GitifyState,
  GitifySubject,
  Link,
  SettingsState,
} from '../../types';
import type { Notification } from '../../typesGitHub';
import { listNotificationsForAuthenticatedUser } from '../api/client';
import { determineFailureType } from '../api/errors';
import {
  DiscussionDetailsFragmentDoc,
  IssueDetailsFragmentDoc,
  PullRequestDetailsFragmentDoc,
} from '../api/graphql/generated/graphql';
import { getHeaders } from '../api/request';
import { getGitHubGraphQLUrl, getNumberFromUrl } from '../api/utils';
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
          let notifications = (
            await accountNotifications.notifications
          ).data.map((notification: Notification) => ({
            ...notification,
            account: accountNotifications.account,
          }));

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
  notifications: Notification[],
  settings: SettingsState,
): Promise<Notification[]> {
  if (!settings.detailedNotifications) {
    return notifications;
  }
  type NotificationKind = 'PullRequest' | 'Issue' | 'Discussion';

  type QueryConfig = {
    aliasPrefix: string;
    fragment: string;
    extras: Array<{
      name: string;
      type: string;
      defaultValue: number | boolean;
    }>;
    selection: (index: number) => string;
  };

  const queryConfigs: Record<NotificationKind, QueryConfig> = {
    PullRequest: {
      aliasPrefix: 'pr',
      fragment: PullRequestDetailsFragmentDoc.toString(),
      extras: [
        { name: 'firstLabels', type: 'Int', defaultValue: 100 },
        { name: 'lastComments', type: 'Int', defaultValue: 100 },
        { name: 'lastReviews', type: 'Int', defaultValue: 100 },
        { name: 'firstClosingIssues', type: 'Int', defaultValue: 100 },
      ],
      selection: (
        index: number,
      ) => `pr${index}: repository(owner: $owner${index}, name: $name${index}) {
          pullRequest(number: $number${index}) {
            ...PullRequestDetails
          }
        }`,
    },
    Issue: {
      aliasPrefix: 'issue',
      fragment: IssueDetailsFragmentDoc.toString(),
      extras: [
        { name: 'lastComments', type: 'Int', defaultValue: 100 },
        { name: 'firstLabels', type: 'Int', defaultValue: 100 },
      ],
      selection: (
        index: number,
      ) => `issue${index}: repository(owner: $owner${index}, name: $name${index}) {
          issue(number: $number${index}) {
            ...IssueDetails
          }
        }`,
    },
    Discussion: {
      aliasPrefix: 'discussion',
      fragment: DiscussionDetailsFragmentDoc.toString(),
      extras: [
        { name: 'lastComments', type: 'Int', defaultValue: 100 },
        { name: 'lastReplies', type: 'Int', defaultValue: 100 },
        { name: 'firstLabels', type: 'Int', defaultValue: 100 },
        { name: 'includeIsAnswered', type: 'Boolean!', defaultValue: true },
      ],
      selection: (
        index: number,
      ) => `discussion${index}: repository(owner: $owner${index}, name: $name${index}) {
          discussion(number: $number${index}) {
            ...DiscussionDetails
          }
        }`,
    },
  };

  const selections: string[] = [];
  const variableDefinitions: string[] = [];
  const variableValues: Record<string, string | number | boolean> = {};
  const extraVariableDefinitions = new Map<string, string>();
  const extraVariableValues: Record<string, number | boolean> = {};
  const fragments = new Map<string, string>();
  const targets: Array<{
    alias: string;
    kind: NotificationKind;
    notification: Notification;
  }> = [];

  const collectFragments = (doc: string) => {
    const fragmentRegex =
      /fragment\s+[A-Za-z0-9_]+\s+on[\s\S]*?(?=(?:fragment\s+[A-Za-z0-9_]+\s+on)|$)/g;
    const nameRegex = /fragment\s+([A-Za-z0-9_]+)\s+on/;

    const matches = doc.match(fragmentRegex) ?? [];
    for (const match of matches) {
      const nameMatch = match.match(nameRegex);
      if (!nameMatch) {
        continue;
      }
      const name = nameMatch[1];
      if (!fragments.has(name)) {
        fragments.set(name, match.trim());
      }
    }
  };

  let index = 0;

  for (const notification of notifications) {
    const kind = notification.subject.type as NotificationKind;
    const config = queryConfigs[kind];

    if (!config) {
      continue;
    }

    const org = notification.repository.owner.login;
    const repo = notification.repository.name;
    const number = getNumberFromUrl(notification.subject.url);

    const alias = `${config.aliasPrefix}${index}`;

    selections.push(config.selection(index));
    variableDefinitions.push(
      `$owner${index}: String!, $name${index}: String!, $number${index}: Int!`,
    );
    variableValues[`owner${index}`] = org;
    variableValues[`name${index}`] = repo;
    variableValues[`number${index}`] = number;
    targets.push({ alias, kind, notification });

    for (const extra of config.extras) {
      if (!extraVariableDefinitions.has(extra.name)) {
        extraVariableDefinitions.set(extra.name, extra.type);
        extraVariableValues[extra.name] = extra.defaultValue;
      }
    }

    collectFragments(config.fragment);

    index += 1;
  }

  if (selections.length === 0) {
    const enrichedNotifications = await Promise.all(
      notifications.map(async (notification: Notification) => {
        return enrichNotification(notification, settings);
      }),
    );
    return enrichedNotifications;
  }

  const combinedVariableDefinitions = [
    ...variableDefinitions,
    ...Array.from(extraVariableDefinitions.entries()).map(
      ([name, type]) => `$${name}: ${type}`,
    ),
  ].join(', ');

  const mergedQuery = `query FetchMergedNotifications(${combinedVariableDefinitions}) {
${selections.join('\n')}
}

${Array.from(fragments.values()).join('\n')}`;

  const queryVariables = {
    ...variableValues,
    ...extraVariableValues,
  };

  let mergedData: Record<string, unknown> | null = null;

  try {
    const url = getGitHubGraphQLUrl(
      notifications[0].account.hostname,
    ).toString();
    const token = notifications[0].account.token;

    const headers = await getHeaders(url as Link, token);

    const response = await axios({
      method: 'POST',
      url,
      data: {
        query: mergedQuery,
        variables: queryVariables,
      },
      headers: headers,
    });

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
    notifications.map(async (notification: Notification) => {
      const handler = createNotificationHandler(notification);

      const target = targets.find((item) => item.notification === notification);

      if (mergedData && target) {
        const repoData = mergedData[target.alias] as
          | { pullRequest?: unknown; issue?: unknown; discussion?: unknown }
          | undefined;

        let fragment: unknown;
        if (target.kind === 'PullRequest') {
          fragment = repoData?.pullRequest;
        } else if (target.kind === 'Issue') {
          fragment = repoData?.issue;
        } else if (target.kind === 'Discussion') {
          fragment = repoData?.discussion;
        }

        if (fragment) {
          const details = await handler.enrich(
            notification,
            settings,
            fragment,
          );
          return {
            ...notification,
            subject: {
              ...notification.subject,
              ...details,
            },
          };
        }
      }

      const fetchedDetails = await handler.fetchAndEnrich(
        notification,
        settings,
      );
      return {
        ...notification,
        subject: {
          ...notification.subject,
          ...fetchedDetails,
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
  notification: Notification,
  settings: SettingsState,
) {
  let additionalSubjectDetails: GitifySubject = {};

  try {
    const handler = createNotificationHandler(notification);
    additionalSubjectDetails = await handler.fetchAndEnrich(
      notification,
      settings,
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
