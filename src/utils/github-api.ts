import {
  AlertIcon,
  CheckIcon,
  CommentDiscussionIcon,
  GitCommitIcon,
  GitMergeIcon,
  GitPullRequestClosedIcon,
  GitPullRequestDraftIcon,
  GitPullRequestIcon,
  IssueClosedIcon,
  IssueDraftIcon,
  IssueOpenedIcon,
  IssueReopenedIcon,
  MailIcon,
  OcticonProps,
  QuestionIcon,
  RocketIcon,
  SkipIcon,
  StopIcon,
  SyncIcon,
  TagIcon,
  XIcon,
} from '@primer/octicons-react';
import { CheckSuiteStatus, Reason, Subject } from '../typesGithub';

// prettier-ignore
const DESCRIPTIONS = {
    ASSIGN: 'You were assigned to the issue.',
    AUTHOR: 'You created the thread.',
    COMMENT: 'You commented on the thread.',
    INVITATION: 'You accepted an invitation to contribute to the repository.',
    MANUAL: 'You subscribed to the thread (via an issue or pull request).',
    MEMBER_FEATURE_REQUESTED: 'Organization members have requested to enable a feature such as Draft Pull Requests or CoPilot.',
    MENTION: 'You were specifically @mentioned in the content.',
    REVIEW_REQUESTED: "You, or a team you're a member of, were requested to review a pull request.",
    SECURITY_ADVISORY_CREDIT: "You were credited for contributing to a security advisory.",
    SECURITY_ALERT: 'GitHub discovered a security vulnerability in your repository.',
    STATE_CHANGE: 'You changed the thread state (for example, closing an issue or merging a pull request).',
    SUBSCRIBED: "You're watching the repository.",
    TEAM_MENTION: 'You were on a team that was mentioned.',
    CI_ACTIVITY: 'A GitHub Actions workflow run was triggered for your repository',
    UNKNOWN: 'The reason for this notification is not supported by the app.',
};

export function formatReason(reason: Reason): {
  type: string;
  description: string;
} {
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
    case 'member_feature_requested':
      return { type: 'Member Feature Requested', description: DESCRIPTIONS['MEMBER_FEATURE_REQUESTED'] };
    case 'mention':
      return { type: 'Mention', description: DESCRIPTIONS['MENTION'] };
    case 'review_requested':
      return { type: 'Review Requested', description: DESCRIPTIONS['REVIEW_REQUESTED'] };
    case 'security_advisory_credit':
      return { type: 'Security Advisory Credit', description: DESCRIPTIONS['SECURITY_ADVISORY_CREDIT'] };
    case 'security_alert':
      return { type: 'Security Alert', description: DESCRIPTIONS['SECURITY_ALERT'] };
    case 'state_change':
      return { type: 'State Change', description: DESCRIPTIONS['STATE_CHANGE'] };
    case 'subscribed':
      return { type: 'Subscribed', description: DESCRIPTIONS['SUBSCRIBED'] };
    case 'team_mention':
      return { type: 'Team Mention', description: DESCRIPTIONS['TEAM_MENTION'] };
    case 'ci_activity':
      return { type: 'Workflow Run', description: DESCRIPTIONS['CI_ACTIVITY'] };
    default:
      return { type: 'Unknown', description: DESCRIPTIONS['UNKNOWN'] };
  }
}

export function getNotificationTypeIcon(
  subject: Subject,
): React.FC<OcticonProps> {
  switch (subject.type) {
    case 'CheckSuite':
      const checkSuiteState = inferCheckSuiteStatus(subject.title);

      switch (checkSuiteState) {
        case 'cancelled':
          return StopIcon;
        case 'failure':
          return XIcon;
        case 'skipped':
          return SkipIcon;
        case 'success':
          return CheckIcon;
        default:
          return SyncIcon;
      }
    case 'Commit':
      return GitCommitIcon;
    case 'Discussion':
      return CommentDiscussionIcon;
    case 'Issue':
      switch (subject.state) {
        case 'draft':
          return IssueDraftIcon;
        case 'closed':
        case 'completed':
          return IssueClosedIcon;
        case 'reopened':
          return IssueReopenedIcon;
        default:
          return IssueOpenedIcon;
      }
    case 'PullRequest':
      switch (subject.state) {
        case 'draft':
          return GitPullRequestDraftIcon;
        case 'closed':
          return GitPullRequestClosedIcon;
        case 'merged':
          return GitMergeIcon;
        default:
          return GitPullRequestIcon;
      }
    case 'Release':
      return TagIcon;
    case 'RepositoryInvitation':
      return MailIcon;
    case 'RepositoryVulnerabilityAlert':
      return AlertIcon;
    case 'WorkflowRun':
      return RocketIcon;
    default:
      return QuestionIcon;
  }
}

export function getNotificationTypeIconColor(subject: Subject): string {
  if (subject.type === 'CheckSuite') {
    const checkSuiteState = inferCheckSuiteStatus(subject.title);

    switch (checkSuiteState) {
      case 'cancelled':
        return 'text-gray-500';
      case 'failure':
        return 'text-red-500';
      case 'skipped':
        return 'text-gray-500';
      case 'success':
        return 'text-green-500';
      default:
        return 'text-gray-300';
    }
  }

  switch (subject.state) {
    case 'closed':
      return 'text-red-500';
    case 'completed':
      return 'text-purple-500';
    case 'draft':
      return 'text-gray-600';
    case 'merged':
      return 'text-purple-500';
    case 'not_planned':
      return 'text-gray-300';
    case 'open':
      return 'text-green-500';
    case 'reopened':
      return 'text-green-500';
    default:
      return 'text-gray-300';
  }
}

export function inferCheckSuiteStatus(title: string): CheckSuiteStatus {
  if (title) {
    const lowerTitle = title.toLowerCase();

    if (lowerTitle.includes('cancelled for')) {
      return 'cancelled';
    }

    if (lowerTitle.includes('failed for')) {
      return 'failure';
    }

    if (lowerTitle.includes('skipped for')) {
      return 'skipped';
    }

    if (lowerTitle.includes('succeeded for')) {
      return 'success';
    }
  }

  return null;
}
