import { Reason, SubjectType } from '../../types/github';

// prettier-ignore
const DESCRIPTIONS = {
    ASSIGN: 'You were assigned to the issue.',
    AUTHOR: 'You created the thread.',
    COMMENT: 'You commented on the thread.',
    INVITATION: 'You accepted an invitation to contribute to the repository.',
    MANUAL: 'You subscribed to the thread (via an issue or pull request).',
    MENTION: 'You were specifically @mentioned in the content.',
    REVIEW_REQUESTED: "You, or a team you're a member of, were requested to review a pull request.",
    SECURITY_ALERT: 'GitHub discovered a security vulnerability in your repository.',
    STATE_CHANGE: 'You changed the thread state (for example, closing an issue or merging a pull request).',
    SUBSCRIBED: "You're watching the repository.",
    TEAM_MENTION: 'You were on a team that was mentioned.',
    CI_ACTIVITY: 'A GitHub Actions workflow run was triggered for your repository',
    UNKNOWN: 'The reason for this notification is not supported by the app.',
};

export function formatReason(
  reason: Reason
): { type: string; description: string } {
  // prettier-ignore
  switch (reason) {
    case 'assign':
      return { type: 'Assign', description: DESCRIPTIONS['ASSIGN'] };
    case 'author':
      return { type: 'Author', description: DESCRIPTIONS['AUTHOR'] };
    case 'comment':
      return { type: 'Comment', description: DESCRIPTIONS['COMMENT'] };
    case 'invitation':
      return { type: 'Invitation', description: DESCRIPTIONS['INVITATION'] };
    case 'manual':
      return { type: 'Manual', description: DESCRIPTIONS['MANUAL'] };
    case 'mention':
      return { type: 'Mention', description: DESCRIPTIONS['MENTION'] };
    case 'review_requested':
      return { type: 'Review Requested', description: DESCRIPTIONS['REVIEW_REQUESTED'] };
    case 'security_alert':
      return { type: 'Security Alert', description: DESCRIPTIONS['SECURITY_ALERT'] };
    case 'state_change':
      return { type: 'State Change', description: DESCRIPTIONS['STATE_CHANGE'] };
    case 'subscribed':
      return { type: 'Subscribed', description: DESCRIPTIONS['SUBSCRIBED'] };
    case 'team_mention':
      return { type: 'Team Mention', description: DESCRIPTIONS['TEAM_MENTION'] };
    case 'ci_activity':
      return { type: 'Workflow Run', description: DESCRIPTIONS['WORKFLOW_RUN'] };
    default:
      return { type: 'Unknown', description: DESCRIPTIONS['UNKNOWN'] };
  }
}

export function getNotificationTypeIcon(type: SubjectType): string {
  switch (type) {
    case 'Issue':
      return 'issue-opened';
    case 'PullRequest':
      return 'git-pull-request';
    case 'Commit':
      return 'git-commit';
    case 'Release':
      return 'tag';
    case 'RepositoryVulnerabilityAlert':
      return 'alert';
    case 'CheckSuite':
      return 'sync';
    default:
      return 'question';
  }
}
