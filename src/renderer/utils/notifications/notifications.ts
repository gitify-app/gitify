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

  // Build combined query for pull requests (builder is immutable)
  let mergedQuery = '';
  let i = 0;
  const args = [];

  for (const notification of notifications) {
    if (notification.subject.type === 'PullRequest') {
      const org = notification.repository.owner.login;
      const repo = notification.repository.name;
      const number = getNumberFromUrl(notification.subject.url);

      args.push({
        org: org,
        repo: repo,
        number: number,
      });

      mergedQuery += `repo${i}: repository(owner: $owner${i}, name: $name${i}) {
          pullRequest(number: $number${i}) {
            title
          }
        }\n`;

      i += 1;

      // const handler = createNotificationHandler(notification);
      // const queryData = handler.query(notification);
    }
  }

  let queryArgs = '';
  let queryArgsVariables = {};

  for (let idx = 0; idx < args.length; idx++) {
    const arg = args[idx];
    if (idx > 0) {
      queryArgs += ', ';
    }
    queryArgs += `$owner${idx}: String!, $name${idx}: String!, $number${idx}: Int!`;
    queryArgsVariables = {
      ...queryArgsVariables,
      [`owner${idx}`]: arg.org,
      [`name${idx}`]: arg.repo,
      [`number${idx}`]: arg.number,
    };
  }

  mergedQuery = `query JumboQuery(${queryArgs}) {\n${mergedQuery}}\n`;

  console.log('ADAM COMBINED QUERY ', JSON.stringify(mergedQuery, null, 2));
  console.log(
    'ADAM COMBINED ARGS ',
    JSON.stringify(queryArgsVariables, null, 2),
  );

  try {
    const url = getGitHubGraphQLUrl(
      notifications[0].account.hostname,
    ).toString();
    const token = notifications[0].account.token;

    const headers = await getHeaders(url as Link, token);

    axios({
      method: 'POST',
      url,
      data: {
        query: mergedQuery,
        variables: queryArgsVariables,
      },
      headers: headers,
    }).then((response) => {
      console.log('ADAM RESPONSE ', JSON.stringify(response, null, 2));
    });
  } catch (err) {
    console.error('oops');
  }

  //   const headers = await getHeaders(url.toString() as Link, token);

  //   await axios.post(url.toString(), combined, { headers });
  // } catch (err) {
  //   rendererLogError(
  //     'enrichNotifications',
  //     'failed to fetch batch pull request details',
  //     err,
  //   );
  // }

  const enrichedNotifications = await Promise.all(
    notifications.map(async (notification: Notification) => {
      return enrichNotification(notification, settings);
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
