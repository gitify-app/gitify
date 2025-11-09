import type { Notification } from '../../../typesGitHub';
import { createCheckSuiteHandler } from './checkSuite';
import { createCommitHandler } from './commit';
import { createDefaultHandler } from './default';
import { createDiscussionHandler } from './discussion';
import { createIssueHandler } from './issue';
import { createPullRequestHandler } from './pullRequest';
import { createReleaseHandler } from './release';
import { createRepositoryDependabotAlertsThreadHandler } from './repositoryDependabotAlertsThread';
import { createRepositoryInvitationHandler } from './repositoryInvitation';
import { createRepositoryVulnerabilityAlertHandler } from './repositoryVulnerabilityAlert';
import type { NotificationTypeHandler } from './types';
import { createWorkflowRunHandler } from './workflowRun';

export function createNotificationHandler(
  notification: Notification,
): NotificationTypeHandler {
  switch (notification.subject.type) {
    case 'CheckSuite':
      return createCheckSuiteHandler(notification);
    case 'Commit':
      return createCommitHandler(notification);
    case 'Discussion':
      return createDiscussionHandler(notification);
    case 'Issue':
      return createIssueHandler(notification);
    case 'PullRequest':
      return createPullRequestHandler(notification);
    case 'Release':
      return createReleaseHandler(notification);
    case 'RepositoryDependabotAlertsThread':
      return createRepositoryDependabotAlertsThreadHandler(notification);
    case 'RepositoryInvitation':
      return createRepositoryInvitationHandler(notification);
    case 'RepositoryVulnerabilityAlert':
      return createRepositoryVulnerabilityAlertHandler(notification);
    case 'WorkflowRun':
      return createWorkflowRunHandler(notification);
    default:
      return createDefaultHandler(notification);
  }
}
