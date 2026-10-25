import type { SubjectType } from '../../../../types';

/**
 * Subject types whose handlers support merged GraphQL enrichment.
 *
 * Keep in sync with `supportsMergedQueryEnrichment` on the GitHub handlers.
 * This lives outside `handlers/index.ts` so the API client can decide which
 * notifications to batch without importing the handlers (which import the
 * client back).
 */
export const MERGED_QUERY_SUBJECT_TYPES: ReadonlySet<SubjectType> = new Set([
  'Discussion',
  'Issue',
  'PullRequest',
]);
