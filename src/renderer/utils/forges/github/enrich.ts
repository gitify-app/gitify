import type { GitifySubject, RawGitifyNotification } from '../../../types';

import { rendererLogError, rendererLogWarn, toError } from '../../core/logger';
import { reportBlockedOrganizations } from '../../notifications/orgAuthorization';
import type { OrganizationBlockReason } from '../../notifications/orgAuthorization';
import { type NotificationDetailFailures, fetchNotificationDetailsForList } from './client';
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
  const { merged, failures } = await fetchInBatches(notifications);

  if (notifications.length) {
    // Replace the account's observed blocks with this pass's, so an
    // organization that stops blocking drops out on the next pass.
    reportBlockedOrganizations(notifications[0].account, {
      organizations: failures.blocks,
      hasUnattributed: failures.hasUnattributedBlock,
    });
  }

  return Promise.all(
    notifications.map((notification) => enrichSingle(notification, merged.get(notification))),
  );
}

async function fetchInBatches(notifications: RawGitifyNotification[]): Promise<{
  merged: Map<RawGitifyNotification, FetchMergedDetailsTemplateQuery['repository']>;
  failures: NotificationDetailFailures;
}> {
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

        // A thrown batch cannot be attributed to any notification, so it is
        // recorded as an unattributed block rather than dropped.
        return {
          details: new Map<RawGitifyNotification, FetchMergedDetailsTemplateQuery['repository']>(),
          failures: {
            blocks: new Map<string, OrganizationBlockReason>(),
            hasUnattributedBlock: true,
          },
        };
      }
    }),
  );

  const merged = new Map<RawGitifyNotification, FetchMergedDetailsTemplateQuery['repository']>();
  const blocks = new Map<string, OrganizationBlockReason>();
  let hasUnattributedBlock = false;

  for (const result of batchResults) {
    for (const [notification, repository] of result.details) {
      merged.set(notification, repository);
    }

    for (const [login, reason] of result.failures.blocks) {
      blocks.set(login, reason);
    }

    hasUnattributedBlock ||= result.failures.hasUnattributedBlock;
  }

  return {
    merged,
    failures: {
      blocks,
      hasUnattributedBlock,
    },
  };
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
