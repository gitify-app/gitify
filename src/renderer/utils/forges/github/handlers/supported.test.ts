import { mockPartialGitifyNotification } from '../../../../__mocks__/notifications-mocks';

import type { SubjectType } from '../../../../types';

import { createNotificationHandler } from './index';
import { MERGED_QUERY_SUBJECT_TYPES } from './supported';

const SUBJECT_TYPES: SubjectType[] = [
  'AgentSessionThread',
  'BitbucketNotification',
  'CheckSuite',
  'Commit',
  'Discussion',
  'GitLabTodo',
  'Issue',
  'PullRequest',
  'Release',
  'RepositoryAdvisory',
  'RepositoryDependabotAlertsThread',
  'RepositoryInvitation',
  'RepositoryVulnerabilityAlert',
  'WorkflowRun',
];

describe('renderer/utils/forges/github/handlers/supported.ts', () => {
  it('matches the handlers that support merged query enrichment', () => {
    for (const type of SUBJECT_TYPES) {
      const handler = createNotificationHandler(mockPartialGitifyNotification({ type }));

      expect(MERGED_QUERY_SUBJECT_TYPES.has(type)).toBe(handler.supportsMergedQueryEnrichment);
    }
  });
});
