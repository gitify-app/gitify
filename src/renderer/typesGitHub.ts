import type { components } from '@octokit/openapi-types';

import type { GitifyNotification, GitifySubject, Link } from './types';

// TODO: #828 Add explicit types for GitHub API response vs Gitify Notifications object

export interface GitHubRESTError {
  message: string;
  documentation_url: Link;
}

// Stronger typings for string literal attributes
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

export type UserType =
  | 'Bot'
  | 'EnterpriseUserAccount'
  | 'Mannequin'
  | 'Organization'
  | 'User';

// Base types from Octokit
export type NotificationThreadSubscription =
  components['schemas']['thread-subscription'];

type BaseNotification = components['schemas']['thread'];
type BaseUser = components['schemas']['simple-user'];
type BaseRepository = components['schemas']['repository'];
type BaseCommit = components['schemas']['commit'];
type BaseCommitComment = components['schemas']['commit-comment'];
type BaseRelease = components['schemas']['release'];
type BaseSubject = components['schemas']['thread']['subject'];

// Strengthen user-related types with explicit property overrides
type GitHubNotification = Omit<
  BaseNotification,
  'reason' | 'subject' | 'repository'
> & {
  reason: Reason;
  subject: Subject;
  repository: Repository;
};

type GitHubSubject = Omit<
  BaseSubject,
  'url' | 'latest_comment_url' | 'type'
> & {
  url: Link;
  latest_comment_url: Link;
  type: SubjectType;
};

type StrengthenNullable<T, K extends keyof T, Extra> = Omit<T, K> & {
  [P in K]: T[P] extends null ? null : NonNullable<T[P]> & Extra;
};

// Exported strengthened types
export type Notification = GitHubNotification & GitifyNotification;

export type Subject = GitHubSubject & GitifySubject;

export type Repository = Omit<BaseRepository, 'html_url' | 'owner'> & {
  html_url: Link;
  owner: Owner;
};

export type User = Omit<BaseUser, 'type'> & { type: UserType };

export type Owner = Omit<
  NonNullable<BaseRepository['owner']>,
  'type' | 'avatar_url'
> & {
  type: UserType;
  avatar_url: Link;
};

export type Commit = StrengthenNullable<
  BaseCommit,
  'author',
  { type: UserType }
>;
export type CommitComment = StrengthenNullable<
  BaseCommitComment,
  'user',
  { type: UserType }
>;
export type Release = StrengthenNullable<
  BaseRelease,
  'author',
  { type: UserType }
>;
