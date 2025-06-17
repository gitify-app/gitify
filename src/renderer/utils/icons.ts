import type { FC } from 'react';

import {
  AlertIcon,
  AppsIcon,
  CheckIcon,
  CommentDiscussionIcon,
  CommentIcon,
  DiscussionClosedIcon,
  DiscussionDuplicateIcon,
  DiscussionOutdatedIcon,
  FeedPersonIcon,
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
  KeyIcon,
  MailIcon,
  MarkGithubIcon,
  type OcticonProps,
  OrganizationIcon,
  PersonIcon,
  QuestionIcon,
  RocketIcon,
  ServerIcon,
  SkipIcon,
  StopIcon,
  TagIcon,
  XIcon,
} from '@primer/octicons-react';

import { IconColor, type PullRequestApprovalIcon } from '../types';
import type {
  GitifyPullRequestReview,
  Subject,
  UserType,
} from '../typesGitHub';
import type { AuthMethod, PlatformType } from './auth/types';

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
    case 'RepositoryDependabotAlertsThread':
      return AlertIcon;
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
        color: IconColor.YELLOW,
        description: `${descriptionPrefix} left review comments`,
      };
    case 'DISMISSED':
      return {
        type: CommentIcon,
        color: IconColor.GRAY,
        description: `${descriptionPrefix} ${
          review.users.length > 1 ? 'reviews have' : 'review has'
        } been dismissed`,
      };
    default:
      return null;
  }
}

export function getAuthMethodIcon(method: AuthMethod): FC<OcticonProps> | null {
  switch (method) {
    case 'GitHub App':
      return AppsIcon;
    case 'OAuth App':
      return PersonIcon;
    default:
      return KeyIcon;
  }
}

export function getPlatformIcon(
  platform: PlatformType,
): FC<OcticonProps> | null {
  switch (platform) {
    case 'GitHub Enterprise Server':
      return ServerIcon;
    default:
      return MarkGithubIcon;
  }
}

export function getDefaultUserIcon(userType: UserType) {
  switch (userType) {
    case 'Bot':
    case 'Mannequin':
      return MarkGithubIcon;
    case 'Organization':
      return OrganizationIcon;
    default:
      return FeedPersonIcon;
  }
}
