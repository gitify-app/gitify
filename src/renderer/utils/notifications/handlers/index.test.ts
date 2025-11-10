import { partialMockNotification } from '../../../__mocks__/partial-mocks';
import type { SubjectType } from '../../../typesGitHub';
import { createCheckSuiteHandler } from './checkSuite';
import { createCommitHandler } from './commit';
import { createDefaultHandler } from './default';
import { createDiscussionHandler } from './discussion';
import { createNotificationHandler } from './index';
import { createIssueHandler } from './issue';
import { createPullRequestHandler } from './pullRequest';
import { createReleaseHandler } from './release';
import { createRepositoryDependabotAlertsThreadHandler } from './repositoryDependabotAlertsThread';
import { createRepositoryInvitationHandler } from './repositoryInvitation';
import { createRepositoryVulnerabilityAlertHandler } from './repositoryVulnerabilityAlert';
import { createWorkflowRunHandler } from './workflowRun';

describe('renderer/utils/notifications/handlers/index.ts', () => {
  describe('createNotificationHandler', () => {
    const cases: Array<[SubjectType, object]> = [
      ['CheckSuite', createCheckSuiteHandler],
      ['Commit', createCommitHandler],
      ['Discussion', createDiscussionHandler],
      ['Issue', createIssueHandler],
      ['PullRequest', createPullRequestHandler],
      ['Release', createReleaseHandler],
      [
        'RepositoryDependabotAlertsThread',
        createRepositoryDependabotAlertsThreadHandler,
      ],
      ['RepositoryInvitation', createRepositoryInvitationHandler],
      [
        'RepositoryVulnerabilityAlert',
        createRepositoryVulnerabilityAlertHandler,
      ],
      ['WorkflowRun', createWorkflowRunHandler],
    ];

    it.each(cases)(
      'returns expected handler instance for %s',
      (type, expected) => {
        const notification = partialMockNotification({ type });

        createNotificationHandler(notification);

        expect(expected).toHaveBeenCalledWith(notification);
      },
    );

    it('falls back to default handler for unknown type', () => {
      const notification = partialMockNotification({
        type: 'SomeFutureType' as SubjectType,
      });

      createNotificationHandler(notification);

      expect(createDefaultHandler).toHaveBeenCalledWith(notification);
    });
  });
});
