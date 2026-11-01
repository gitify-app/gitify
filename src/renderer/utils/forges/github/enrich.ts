import type { GitifySubject, RawGitifyNotification } from '../../../types';

import { rendererLogError, rendererLogWarn, toError } from '../../core/logger';
import { fetchNotificationDetailsForList } from './client';
import type { FetchMergedDetailsTemplateQuery } from './graphql/generated/graphql';
import { createNotificationHandler } from './handlers';

/**
 * Maximum number of notifications batched into a single merged GraphQL query
 * by `enrichGitHubNotifications` before the batch is split. The merged query
 * pulls nested connections for every notification, so batches that exceed
 * GitHub's undocumented resource limit are retried in progressively smaller
 * halves by `fetchInBatches`.
 */
export const GITHUB_API_MERGE_BATCH_SIZE = 100;

/**
 * Enrich GitHub notifications with additional subject details (state, user,
 * comment count, labels, etc.) by issuing a single batched GraphQL query
 * and dispatching to per-subject-type handlers.
 *
 * Notifications whose detail fetch fails are returned unchanged, preserving
 * their original `subject` reference so callers can detect the failure (see
 * the `enrichNotifications` adapter contract).
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
  const supportedNotifications = notifications.filter(
    (notification) => createNotificationHandler(notification).supportsMergedQueryEnrichment,
  );

  const batchSize = GITHUB_API_MERGE_BATCH_SIZE;
  const batches: RawGitifyNotification[][] = [];
  for (let start = 0; start < supportedNotifications.length; start += batchSize) {
    batches.push(supportedNotifications.slice(start, start + batchSize));
  }

  const batchResults = await Promise.all(batches.map((batch) => fetchBatch(batch)));

  const merged = new Map<RawGitifyNotification, FetchMergedDetailsTemplateQuery['repository']>();
  for (const results of batchResults) {
    for (const [notification, repository] of results) {
      merged.set(notification, repository);
    }
  }

  return merged;
}

/** Batches at or below this size are not split further; they fall through to per-notification fallback. */
const MIN_SPLIT_BATCH_SIZE = 25;

const RESOURCE_LIMIT_ERROR_MESSAGE = 'Resource limits for this query exceeded';

function isResourceLimitError(error: unknown): boolean {
  return error instanceof Error && error.message.includes(RESOURCE_LIMIT_ERROR_MESSAGE);
}

async function fetchBatch(
  notifications: RawGitifyNotification[],
): Promise<Map<RawGitifyNotification, FetchMergedDetailsTemplateQuery['repository']>> {
  try {
    return await fetchNotificationDetailsForList(notifications);
  } catch (err) {
    if (isResourceLimitError(err)) {
      if (notifications.length <= MIN_SPLIT_BATCH_SIZE) {
        rendererLogError(
          'enrichGitHubNotifications',
          `Failed to fetch merged notification details for ${notifications.length} notifications`,
          toError(err),
        );
        return new Map();
      }

      const midpoint = Math.ceil(notifications.length / 2);
      rendererLogWarn(
        'enrichGitHubNotifications',
        `Splitting merged notification batch of ${notifications.length} after resource limit`,
      );

      const [first, second] = await Promise.all([
        fetchBatch(notifications.slice(0, midpoint)),
        fetchBatch(notifications.slice(midpoint)),
      ]);

      return new Map([...first, ...second]);
    }

    rendererLogError(
      'enrichGitHubNotifications',
      `Failed to fetch merged notification details for ${notifications.length} notifications`,
      toError(err),
    );
    return new Map();
  }
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

    // Keep the original subject reference so callers can tell this
    // notification was not enriched and retry it on a later poll.
    return notification;
  }

  return {
    ...notification,
    subject: {
      ...notification.subject,
      ...additionalSubjectDetails,
    },
  };
}
