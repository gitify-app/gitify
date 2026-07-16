import type { GitifySubject, RawGitifyNotification } from '../../../types';

import { rendererLogError, rendererLogWarn, toError } from '../../core/logger';
import { fetchNotificationDetailsForList } from './client';
import type { FetchMergedDetailsTemplateQuery } from './graphql/generated/graphql';
import { createNotificationHandler } from './handlers';

/**
 * Maximum number of notifications batched into a single merged GraphQL query
 * by `enrichGitHubNotifications`. GitHub's GraphQL alias cap is well above
 * 100; this is a conservative ceiling that keeps individual responses small
 * and parseable.
 */
export const GITHUB_API_MERGE_BATCH_SIZE = 100;

/**
 * Enrich GitHub notifications with additional subject details (state, user,
 * comment count, labels, etc.) by issuing a single batched GraphQL query
 * and dispatching to per-subject-type handlers.
 *
 * Exposed via `githubAdapter.enrichNotifications` so the shared notification
 * orchestrator stays adapter-agnostic.
 */
export async function enrichGitHubNotifications(
  notifications: RawGitifyNotification[],
): Promise<RawGitifyNotification[]> {
  const fragments = await fetchInBatches(notifications);

  return Promise.all(
    notifications.map((notification) => enrichSingle(notification, fragments.get(notification))),
  );
}

async function fetchInBatches(
  notifications: RawGitifyNotification[],
): Promise<Map<RawGitifyNotification, FetchMergedDetailsTemplateQuery['repository']>> {
  const merged = new Map<RawGitifyNotification, FetchMergedDetailsTemplateQuery['repository']>();
  const supportedNotifications = notifications.filter(
    (notification) => createNotificationHandler(notification).supportsMergedQueryEnrichment,
  );

  const batchSize = GITHUB_API_MERGE_BATCH_SIZE;

  for (let start = 0; start < supportedNotifications.length; start += batchSize) {
    const batchIndex = Math.floor(start / batchSize) + 1;
    const slice = supportedNotifications.slice(start, start + batchSize);

    try {
      const batchResults = await fetchNotificationDetailsForList(slice);
      for (const [notification, repository] of batchResults) {
        merged.set(notification, repository);
      }
    } catch (err) {
      rendererLogError(
        'enrichGitHubNotifications',
        `Failed to fetch merged notification details for batch ${batchIndex}`,
        toError(err),
      );
    }
  }

  return merged;
}

async function enrichSingle(
  notification: RawGitifyNotification,
  fetchedData: FetchMergedDetailsTemplateQuery['repository'] | undefined,
): Promise<RawGitifyNotification> {
  let additionalSubjectDetails: Partial<GitifySubject> = {};

  try {
    const handler = createNotificationHandler(notification);
    additionalSubjectDetails = await handler.enrich(notification, fetchedData);
  } catch (err) {
    rendererLogError(
      'enrichGitHubNotifications',
      'failed to enrich notification details for',
      toError(err),
      notification,
    );

    rendererLogWarn('enrichGitHubNotifications', 'Continuing with base notification details');
  }

  return {
    ...notification,
    subject: {
      ...notification.subject,
      ...additionalSubjectDetails,
    },
  };
}
