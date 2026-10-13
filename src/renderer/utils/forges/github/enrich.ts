import type { GitifySubject, RawGitifyNotification } from '../../../types';

import { rendererLogError, rendererLogWarn, toError } from '../../core/logger';
import { fetchNotificationDetailsForList, type MergedNotificationDetails } from './client';
import { createNotificationHandler } from './handlers';
import { getNotificationAuthor } from './handlers/utils';

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
): Promise<Map<RawGitifyNotification, MergedNotificationDetails>> {
  const supportedNotifications = notifications.filter(
    (notification) => createNotificationHandler(notification).supportsMergedQueryEnrichment,
  );

  const batchSize = GITHUB_API_MERGE_BATCH_SIZE;
  const batches: RawGitifyNotification[][] = [];
  for (let start = 0; start < supportedNotifications.length; start += batchSize) {
    batches.push(supportedNotifications.slice(start, start + batchSize));
  }

  const batchResults = await Promise.all(
    batches.map(async (slice, index) => {
      try {
        return await fetchNotificationDetailsForList(slice);
      } catch (err) {
        rendererLogError(
          'enrichGitHubNotifications',
          `Failed to fetch merged notification details for batch ${index + 1}`,
          toError(err),
        );
        return new Map<RawGitifyNotification, MergedNotificationDetails>();
      }
    }),
  );

  const merged = new Map<RawGitifyNotification, MergedNotificationDetails>();
  for (const results of batchResults) {
    for (const [notification, details] of results) {
      merged.set(notification, details);
    }
  }

  return merged;
}

async function enrichSingle(
  notification: RawGitifyNotification,
  details: MergedNotificationDetails | undefined,
): Promise<RawGitifyNotification> {
  let additionalSubjectDetails: Partial<GitifySubject> = {};

  try {
    const handler = createNotificationHandler(notification);
    additionalSubjectDetails = await handler.enrich(notification, details?.node);
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

  const owner = details?.owner;
  const ownerDetails = owner ? getNotificationAuthor([owner]) : undefined;

  return {
    ...notification,
    repository: ownerDetails
      ? {
          ...notification.repository,
          owner: {
            ...notification.repository.owner,
            bio: ownerDetails.bio,
            company: ownerDetails.company,
            location: ownerDetails.location,
            followersCount: ownerDetails.followersCount,
            description: ownerDetails.description,
            websiteUrl: ownerDetails.websiteUrl,
          },
        }
      : notification.repository,
    subject: {
      ...notification.subject,
      ...additionalSubjectDetails,
    },
  };
}
