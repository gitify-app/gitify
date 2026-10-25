import { mockPartialGitifyNotification } from '../../../../__mocks__/notifications-mocks';

import type { SubjectType } from '../../../../types';

import { createNotificationHandler } from './index';
import { MERGED_QUERY_SUBJECT_TYPES } from './supported';

const SUBJECT_TYPES: Record<SubjectType, true> = {
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
  it('matches the handlers that support merged query enrichment', () => {
    for (const type of Object.keys(SUBJECT_TYPES) as SubjectType[]) {
      const handler = createNotificationHandler(mockPartialGitifyNotification({ type }));

      expect(MERGED_QUERY_SUBJECT_TYPES.has(type)).toBe(handler.supportsMergedQueryEnrichment);
    }
  });
});
