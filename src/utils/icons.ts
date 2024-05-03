import {
  AlertIcon,
  CheckIcon,
  CommentDiscussionIcon,
  CommentIcon,
  DiscussionClosedIcon,
  DiscussionDuplicateIcon,
  DiscussionOutdatedIcon,
  FileDiffIcon,
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
import { IconColor, type PullRequestApprovalIcon } from '../types';
import type { GitifyPullRequestReview, Subject } from '../typesGitHub';

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

export function getNotificationTypeIconColor(subject: Subject): IconColor {
  switch (subject.state) {
    case 'open':
    case 'reopened':
    case 'ANSWERED':
    case 'success':
      return IconColor.GREEN;
    case 'closed':
    case 'failure':
      return IconColor.RED;
    case 'completed':
    case 'RESOLVED':
    case 'merged':
      return IconColor.PURPLE;
    default:
      return IconColor.GRAY;
  }
}

export function getPullRequestReviewIcon(
  review: GitifyPullRequestReview,
): PullRequestApprovalIcon | null {
  const descriptionPrefix = review.users.join(', ');

  switch (review.state) {
    case 'APPROVED':
      return {
        type: CheckIcon,
        color: IconColor.GREEN,
        description: `${descriptionPrefix} approved these changes`,
      };
    case 'CHANGES_REQUESTED':
      return {
        type: FileDiffIcon,
        color: IconColor.RED,
        description: `${descriptionPrefix} requested changes`,
      };
    case 'COMMENTED':
      return {
        type: CommentIcon,
        color: IconColor.GRAY,
        description: `${descriptionPrefix} left review comments`,
      };
    case 'DISMISSED':
      return {
        type: CommentIcon,
        color: IconColor.GRAY,
        description: `${descriptionPrefix} ${
          review.users.length > 1 ? 'reviews' : 'review'
        } has been dismissed`,
      };
    default:
      return null;
  }
}
