import { mockPartialGitifyNotification } from '../../../../__mocks__/notifications-mocks';

import type { SubjectType } from '../../../../types';

import { createNotificationHandler } from './index';
import { MERGED_QUERY_SUBJECT_TYPES } from './supported';

/** Every possible subject type; only Discussion, Issue, and PullRequest are batchable. */
const ALL_SUBJECT_TYPES: Record<SubjectType, true> = {
  AgentSessionThread: true,
  BitbucketNotification: true,
  CheckSuite: true,
  Commit: true,
  Discussion: true,
  GitLabTodo: true,
  Issue: true,
  PullRequest: true,
  Release: true,
  RepositoryAdvisory: true,
  RepositoryDependabotAlertsThread: true,
  RepositoryInvitation: true,
  RepositoryVulnerabilityAlert: true,
  WorkflowRun: true,
};

describe('renderer/utils/forges/github/handlers/supported.ts', () => {
  it('pins the subject types that support merged query enrichment', () => {
    expect([...MERGED_QUERY_SUBJECT_TYPES].sort()).toEqual(['Discussion', 'Issue', 'PullRequest']);
  });

  it('marks only the handlers that support merged query enrichment', () => {
    for (const type of Object.keys(ALL_SUBJECT_TYPES) as SubjectType[]) {
      const handler = createNotificationHandler(mockPartialGitifyNotification({ type }));

      expect(MERGED_QUERY_SUBJECT_TYPES.has(type)).toBe(handler.supportsMergedQueryEnrichment);
    }
  });
});
