import type { components } from '@octokit/openapi-types';

import type { GitifyNotification, GitifySubject, Link } from './types';

// TODO: #828 Add explicit types for GitHub API response vs Gitify Notifications object
export type Notification = GitHubNotification &
  GitifyNotification & {
    reason: Reason;
    subject: Subject;
    repository: Repository;
  };
export type Subject = GitHubSubject & {
  url: Link;
  latest_comment_url: Link;
  type: SubjectType;
} & GitifySubject;

/**
 * GitHub REST API Response Types
 **/

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

export type GitHubNotification = components['schemas']['thread'];
export type GitHubSubject = components['schemas']['thread']['subject'];

export type Repository = components['schemas']['repository'] & {
  html_url: Link;
  owner: Owner;
};

export type Owner = NonNullable<BaseRepository['owner']> & {
  type: UserType;
  avatar_url: Link;
};
type BaseRepository = components['schemas']['repository'];

export type Commit = Omit<BaseCommit, 'author'> & {
  author: BaseCommit['author'] extends null ? null : StrongCommitAuthor;
};
type BaseCommit = components['schemas']['commit'];
type StrongCommitAuthor = NonNullable<BaseCommit['author']> & {
  type: UserType;
};

export type CommitComment = Omit<BaseCommitComment, 'user'> & {
  user: BaseCommitComment['user'] extends null ? null : StrongCommitCommentUser;
};
type BaseCommitComment = components['schemas']['commit-comment'];
type StrongCommitCommentUser = NonNullable<BaseCommitComment['user']> & {
  type: UserType;
};

export type Release = Omit<BaseRelease, 'author'> & {
  author: BaseRelease['author'] extends null ? null : StrongReleaseAuthor;
};
type BaseRelease = components['schemas']['release'];
type StrongReleaseAuthor = NonNullable<BaseRelease['author']> & {
  type: UserType;
};

export type NotificationThreadSubscription =
  components['schemas']['thread-subscription'];

export interface GitHubRESTError {
  message: string;
  documentation_url: Link;
}
