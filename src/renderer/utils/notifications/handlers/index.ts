import type { Notification } from '../../../typesGitHub';
import { checkSuiteHandler } from './checkSuite';
import { commitHandler } from './commit';
import { defaultHandler } from './default';
import { discussionHandler } from './discussion';
import { issueHandler } from './issue';
import { pullRequestHandler } from './pullRequest';
import { releaseHandler } from './release';
import { repositoryDependabotAlertsThreadHandler } from './repositoryDependabotAlertsThread copy';
import { repositoryInvitationHandler } from './repositoryInvitation';
import { repositoryVulnerabilityAlertHandler } from './repositoryVulnerabilityAlert';
import type { NotificationTypeHandler } from './types';
import { workflowRunHandler } from './workflowRun';

export function createNotificationHandler(
  notification: Notification,
): NotificationTypeHandler | null {
  switch (notification.subject.type) {
    case 'CheckSuite':
      return checkSuiteHandler;
    case 'WorkflowRun':
      return workflowRunHandler;
    case 'Commit':
      return commitHandler;
    case 'Discussion':
      return discussionHandler;
    case 'Issue':
      return issueHandler;
    case 'PullRequest':
      return pullRequestHandler;
    case 'Release':
      return releaseHandler;
    case 'RepositoryDependabotAlertsThread':
      return repositoryDependabotAlertsThreadHandler;
    case 'RepositoryInvitation':
      return repositoryInvitationHandler;
    case 'RepositoryVulnerabilityAlert':
      return repositoryVulnerabilityAlertHandler;
    default:
      return defaultHandler;
  }
}

export const handlers = {
  checkSuiteHandler,
  workflowRunHandler,
  commitHandler,
  discussionHandler,
  issueHandler,
  pullRequestHandler,
  releaseHandler,
};
