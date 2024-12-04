import type { components } from '@octokit/openapi-types';
import type { Account, Link } from './types';

export type Reason =
  | 'approval_requested'
  | 'assign'
  | 'author'
  | 'ci_activity'
  | 'comment'
  | 'invitation'
  | 'manual'
  | 'member_feature_requested'
  | 'mention'
  | 'review_requested'
  | 'security_advisory_credit'
  | 'security_alert'
  | 'state_change'
  | 'subscribed'
  | 'team_mention';

export type SubjectType =
  | 'CheckSuite'
  | 'Commit'
  | 'Discussion'
  | 'Issue'
  | 'PullRequest'
  | 'Release'
  | 'RepositoryDependabotAlertsThread'
  | 'RepositoryInvitation'
  | 'RepositoryVulnerabilityAlert'
  | 'WorkflowRun';

export type IssueStateType = 'closed' | 'open';

export type IssueStateReasonType = 'completed' | 'not_planned' | 'reopened';

export type UserType =
  | 'Bot'
  | 'EnterpriseUserAccount'
  | 'Mannequin'
  | 'Organization'
  | 'User';

/**
 * Note: draft and merged are not official states in the GitHub API.
 * These are derived from the pull request's `merged` and `draft` properties.
 */
export type PullRequestStateType = 'closed' | 'draft' | 'merged' | 'open';

export type StateType =
  | CheckSuiteStatus
  | DiscussionStateType
  | IssueStateType
  | IssueStateReasonType
  | PullRequestStateType;

export type PullRequestReviewState =
  | 'APPROVED'
  | 'CHANGES_REQUESTED'
  | 'COMMENTED'
  | 'DISMISSED'
  | 'PENDING';

export type GitHubNotification = components['schemas']['thread'];

export type UserDetails = User & UserProfile;

export type User = components['schemas']['simple-user'];

export type UserProfile = components['schemas']['public-user'];

export type Repository = components['schemas']['repository'];

interface GitHubSubject {
  title: string;
  url: Link | null;
  latest_comment_url: Link | null;
  type: SubjectType;
}

export type PullRequest = components['schemas']['pull-request'];

export type PullRequestReview = components['schemas']['pull-request-review'];

export type Commit = components['schemas']['commit'];

export type CommitComment = components['schemas']['commit-comment'];

export type Issue = components['schemas']['issue'];

export interface IssueOrPullRequestComment {
  url: Link;
  html_url: Link;
  issue_url: Link;
  id: number;
  node_id: string;
  user: User;
  created_at: string;
  updated_at: string;
  body: string;
}

export type Milestone = components['schemas']['milestone'];

export type Release = components['schemas']['release'];

export interface GitHubRESTError {
  message: string;
  documentation_url: Link;
}

export type NotificationThreadSubscription =
  components['schemas']['thread-subscription'];

/**
 * GitHub GraphQL API Types
 */
export interface GraphQLSearch<T> {
  data: {
    search: {
      nodes: T[];
    };
  };
}

export interface Discussion {
  number: number;
  title: string;
  stateReason: DiscussionStateType;
  isAnswered: boolean;
  url: Link;
  author: DiscussionAuthor;
  comments: DiscussionComments;
  labels: DiscussionLabels | null;
}

// Note: ANSWERED and OPEN are not an official discussion state type in the GitHub API
export type DiscussionStateType =
  | 'ANSWERED'
  | 'DUPLICATE'
  | 'OPEN'
  | 'OUTDATED'
  | 'REOPENED'
  | 'RESOLVED';

export interface DiscussionAuthor {
  login: string;
  url: Link;
  avatar_url: Link;
  type: UserType;
}

export interface DiscussionLabels {
  nodes: DiscussionLabel[];
}

export interface DiscussionLabel {
  name: string;
}

export interface DiscussionComments {
  nodes: DiscussionComment[];
  totalCount: number;
}

export interface DiscussionComment {
  databaseId: string | number;
  createdAt: string;
  author: DiscussionAuthor;
  replies?: {
    nodes: DiscussionComment[];
  };
}

/**
 * Gitify Type Extensions
 */

// TODO: Add explicit types for GitHub API response vs Gitify Notifications object
export type Notification = GitHubNotification & GitifyNotification;

// Note: This is not in the official GitHub API. We add this to make notification interactions easier.
export interface GitifyNotification {
  account: Account;
  reason: Reason;
  subject: Subject;
}

// This is not in the GitHub API, but we add it to the type to make it easier to work with
export type Subject = GitHubSubject & GitifySubject;

export interface GitifySubject {
  number?: number;
  state?: StateType;
  user?: SubjectUser;
  reviews?: GitifyPullRequestReview[];
  linkedIssues?: string[];
  comments?: number;
  labels?: string[];
  milestone?: Milestone;
}

export interface SubjectUser {
  login: string;
  html_url: Link;
  avatar_url: Link;
  type: UserType;
}

export interface GitifyPullRequestReview {
  state: PullRequestReviewState;
  users: string[];
}

export interface CheckSuiteAttributes {
  workflowName: string;
  attemptNumber?: number;
  statusDisplayName: string;
  status: CheckSuiteStatus | null;
  branchName: string;
}

export interface WorkflowRunAttributes {
  user: string;
  statusDisplayName: string;
  status: CheckSuiteStatus | null;
}

export type CheckSuiteStatus =
  | 'action_required'
  | 'cancelled'
  | 'completed'
  | 'failure'
  | 'in_progress'
  | 'pending'
  | 'queued'
  | 'requested'
  | 'skipped'
  | 'stale'
  | 'success'
  | 'timed_out'
  | 'waiting';
