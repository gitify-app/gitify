import type { components } from '@octokit/openapi-types';

import type { Link, Reason, SubjectType, UserType } from './types';

// Re-export types that are used by external modules
export type { Reason, SubjectType, UserType } from './types';

/**
 * Raw GitHub API types (snake_case) - used at API boundary
 * These are transformed into GitifyNotification/GitifySubject (camelCase)
 * for use throughout the app
 */

export interface GitHubRESTError {
  message: string;
  documentation_url: Link;
}

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
  url: Link | null;
  latest_comment_url: Link | null;
  type: SubjectType;
};

type StrengthenNullable<T, K extends keyof T, Extra> = Omit<T, K> & {
  [P in K]: T[P] extends null ? null : NonNullable<T[P]> & Extra;
};

// Exported strengthened types (raw GitHub API format with snake_case)
export type Notification = GitHubNotification;

export type Subject = GitHubSubject;

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
