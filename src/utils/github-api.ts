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
import type { FormattedReason } from '../types';
import type { Reason, Subject } from '../typesGithub';

const FORMATTED_REASONS: Record<Reason, FormattedReason> = {
  approval_requested: {
    title: 'Approval Requested',
    description: 'You were requested to review and approve a deployment.',
  },
  assign: {
    title: 'Assigned',
    description: 'You were assigned to the issue.',
  },
  author: {
    title: 'Authored',
    description: 'You created the thread.',
  },
  ci_activity: {
    title: 'Workflow Run Completed',
    description:
      'A GitHub Actions workflow run was triggered for your repository.',
  },
  comment: {
    title: 'Commented',
    description: 'You commented on the thread.',
  },
  invitation: {
    title: 'Invitation Received',
    description: 'You accepted an invitation to contribute to the repository.',
  },
  manual: {
    title: 'Updated',
    description: 'You subscribed to the thread (via an issue or pull request).',
  },
  member_feature_requested: {
    title: 'Member Feature Requested',
    description:
      'Organization members have requested to enable a feature such as Draft Pull Requests or Copilot.',
  },
  mention: {
    title: 'Mentioned',
    description: 'You were specifically @mentioned in the content.',
  },
  review_requested: {
    title: 'Review Requested',
    description:
      "You, or a team you're a member of, were requested to review a pull request.",
  },
  security_advisory_credit: {
    title: 'Security Advisory Credit Received',
    description: 'You were credited for contributing to a security advisory.',
  },
  security_alert: {
    title: 'Security Alert Received',
    description:
      'GitHub discovered a security vulnerability in your repository.',
  },
  state_change: {
    title: 'State Changed',
    description:
      'You changed the thread state (for example, closing an issue or merging a pull request).',
  },
  subscribed: {
    title: 'Updated',
    description: "You're watching the repository.",
  },
  team_mention: {
    title: 'Team Mentioned',
    description: 'You were on a team that was mentioned.',
  },
};

const UNKNOWN_REASON: FormattedReason = {
  title: 'Unknown',
  description: 'The reason for this notification is not supported by the app.',
};

export function formatReason(reason: Reason): FormattedReason {
  return FORMATTED_REASONS[reason] || UNKNOWN_REASON;
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
