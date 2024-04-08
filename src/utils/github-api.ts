import {
  AlertIcon,
  CheckIcon,
  CommentDiscussionIcon,
  DiscussionClosedIcon,
  DiscussionDuplicateIcon,
  DiscussionOutdatedIcon,
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
  type OcticonProps,
  QuestionIcon,
  RocketIcon,
  SkipIcon,
  StopIcon,
  TagIcon,
  XIcon,
} from '@primer/octicons-react';
import type { FC } from 'react';
import type { Reason, Subject } from '../typesGithub';

const DESCRIPTIONS = {
  APPROVAL_REQUESTED: 'You were requested to review and approve a deployment.',
  ASSIGN: 'You were assigned to the issue.',
  AUTHOR: 'You created the thread.',
  CI_ACTIVITY:
    'A GitHub Actions workflow run was triggered for your repository',
  COMMENT: 'You commented on the thread.',
  INVITATION: 'You accepted an invitation to contribute to the repository.',
  MANUAL: 'You subscribed to the thread (via an issue or pull request).',
  MEMBER_FEATURE_REQUESTED:
    'Organization members have requested to enable a feature such as Draft Pull Requests or CoPilot.',
  MENTION: 'You were specifically @mentioned in the content.',
  REVIEW_REQUESTED:
    "You, or a team you're a member of, were requested to review a pull request.",
  SECURITY_ADVISORY_CREDIT:
    'You were credited for contributing to a security advisory.',
  SECURITY_ALERT:
    'GitHub discovered a security vulnerability in your repository.',
  STATE_CHANGE:
    'You changed the thread state (for example, closing an issue or merging a pull request).',
  SUBSCRIBED: "You're watching the repository.",
  TEAM_MENTION: 'You were on a team that was mentioned.',
  UNKNOWN: 'The reason for this notification is not supported by the app.',
};

export function formatReason(reason: Reason): {
  type: string;
  description: string;
} {
  switch (reason) {
    case 'approval_requested':
      return {
        type: 'Approval Requested',
        description: DESCRIPTIONS['APPROVAL_REQUESTED'],
      };
    case 'assign':
      return { type: 'Assigned', description: DESCRIPTIONS['ASSIGN'] };
    case 'author':
      return { type: 'Authored', description: DESCRIPTIONS['AUTHOR'] };
    case 'ci_activity':
      return {
        type: 'Workflow Run Completed',
        description: DESCRIPTIONS['CI_ACTIVITY'],
      };
    case 'comment':
      return { type: 'Commented', description: DESCRIPTIONS['COMMENT'] };
    case 'invitation':
      return {
        type: 'Invitation Received',
        description: DESCRIPTIONS['INVITATION'],
      };
    case 'manual':
      return { type: 'Updated', description: DESCRIPTIONS['MANUAL'] };
    case 'member_feature_requested':
      return {
        type: 'Member Feature Requested',
        description: DESCRIPTIONS['MEMBER_FEATURE_REQUESTED'],
      };
    case 'mention':
      return { type: 'Mentioned', description: DESCRIPTIONS['MENTION'] };
    case 'review_requested':
      return {
        type: 'Review Requested',
        description: DESCRIPTIONS['REVIEW_REQUESTED'],
      };
    case 'security_advisory_credit':
      return {
        type: 'Security Advisory Credit Recevied',
        description: DESCRIPTIONS['SECURITY_ADVISORY_CREDIT'],
      };
    case 'security_alert':
      return {
        type: 'Security Alert Received',
        description: DESCRIPTIONS['SECURITY_ALERT'],
      };
    case 'state_change':
      return {
        type: 'State Changed',
        description: DESCRIPTIONS['STATE_CHANGE'],
      };
    case 'subscribed':
      return { type: 'Updated', description: DESCRIPTIONS['SUBSCRIBED'] };
    case 'team_mention':
      return {
        type: 'Team Mentioned',
        description: DESCRIPTIONS['TEAM_MENTION'],
      };
    default:
      return { type: 'Unknown', description: DESCRIPTIONS['UNKNOWN'] };
  }
}

export function getNotificationTypeIcon(subject: Subject): FC<OcticonProps> {
  switch (subject.type) {
    case 'CheckSuite':
      switch (subject.state) {
        case 'cancelled':
          return StopIcon;
        case 'failure':
          return XIcon;
        case 'skipped':
          return SkipIcon;
        case 'success':
          return CheckIcon;
        default:
          return RocketIcon;
      }
    case 'Commit':
      return GitCommitIcon;
    case 'Discussion':
      switch (subject.state) {
        case 'DUPLICATE':
          return DiscussionDuplicateIcon;
        case 'OUTDATED':
          return DiscussionOutdatedIcon;
        case 'RESOLVED':
          return DiscussionClosedIcon;
        default:
          return CommentDiscussionIcon;
      }
    case 'Issue':
      switch (subject.state) {
        case 'draft':
          return IssueDraftIcon;
        case 'closed':
        case 'completed':
          return IssueClosedIcon;
        case 'not_planned':
          return SkipIcon;
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
  switch (subject.state) {
    case 'open':
    case 'reopened':
    case 'ANSWERED':
    case 'success':
      return 'text-green-500';
    case 'closed':
    case 'failure':
      return 'text-red-500';
    case 'completed':
    case 'RESOLVED':
    case 'merged':
      return 'text-purple-500';
    default:
      return 'text-gray-500 dark:text-gray-300';
  }
}
