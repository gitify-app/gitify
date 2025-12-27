import { createPartialMockNotification } from '../../../__mocks__/notifications-mocks';
import type { SubjectType } from '../../../typesGitHub';
import { checkSuiteHandler } from './checkSuite';
import { commitHandler } from './commit';
import { defaultHandler } from './default';
import { discussionHandler } from './discussion';
import { createNotificationHandler } from './index';
import { issueHandler } from './issue';
import { pullRequestHandler } from './pullRequest';
import { releaseHandler } from './release';
import { repositoryDependabotAlertsThreadHandler } from './repositoryDependabotAlertsThread';
import { repositoryInvitationHandler } from './repositoryInvitation';
import { repositoryVulnerabilityAlertHandler } from './repositoryVulnerabilityAlert';
import type { NotificationTypeHandler } from './types';
import { workflowRunHandler } from './workflowRun';

describe('renderer/utils/notifications/handlers/index.ts', () => {
  describe('createNotificationHandler', () => {
    const cases = {
      CheckSuite: checkSuiteHandler,
      Commit: commitHandler,
      Discussion: discussionHandler,
      Issue: issueHandler,
      PullRequest: pullRequestHandler,
      Release: releaseHandler,
      RepositoryDependabotAlertsThread: repositoryDependabotAlertsThreadHandler,
      RepositoryInvitation: repositoryInvitationHandler,
      RepositoryVulnerabilityAlert: repositoryVulnerabilityAlertHandler,
      WorkflowRun: workflowRunHandler,
    } satisfies Record<SubjectType, NotificationTypeHandler>;

    it.each(
      Object.entries(cases) as Array<[SubjectType, NotificationTypeHandler]>,
    )('returns expected handler instance for %s', (type, expected) => {
      const notification = createPartialMockNotification({ type });
      const handler = createNotificationHandler(notification);
      expect(handler).toBe(expected);
    });

    it('falls back to default handler for unknown type', () => {
      const notification = createPartialMockNotification({
        type: 'SomeFutureType' as SubjectType,
      });
      const handler = createNotificationHandler(notification);
      expect(handler).toBe(defaultHandler);
    });
  });
});
