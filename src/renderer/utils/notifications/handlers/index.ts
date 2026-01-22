import type { GitifyNotification } from '../../../types';
import type { NotificationTypeHandler } from './types';

import { checkSuiteHandler } from './checkSuite';
import { commitHandler } from './commit';
import { defaultHandler } from './default';
import { discussionHandler } from './discussion';
import { issueHandler } from './issue';
import { pullRequestHandler } from './pullRequest';
import { releaseHandler } from './release';
import { repositoryDependabotAlertsThreadHandler } from './repositoryDependabotAlertsThread';
import { repositoryInvitationHandler } from './repositoryInvitation';
import { repositoryVulnerabilityAlertHandler } from './repositoryVulnerabilityAlert';
import { workflowRunHandler } from './workflowRun';

export function createNotificationHandler(
  notification: GitifyNotification,
): NotificationTypeHandler {
  switch (notification.subject.type) {
    case 'CheckSuite':
      return checkSuiteHandler;
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
    case 'WorkflowRun':
      return workflowRunHandler;
    default:
      return defaultHandler;
  }
}

export const handlers = {
  checkSuiteHandler,
  commitHandler,
  discussionHandler,
  issueHandler,
  pullRequestHandler,
  releaseHandler,
  repositoryDependabotAlertsThreadHandler,
  repositoryInvitationHandler,
  repositoryVulnerabilityAlertHandler,
  workflowRunHandler,
  defaultHandler,
};
