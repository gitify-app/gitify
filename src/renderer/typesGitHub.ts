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

// Note: ANSWERED and OPEN are not an official discussion state type in the GitHub API
export type DiscussionStateType =
  | 'ANSWERED'
  | 'DUPLICATE'
  | 'OPEN'
  | 'OUTDATED'
  | 'REOPENED'
  | 'RESOLVED';

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

export type PullRequestReviewState =
  | 'APPROVED'
  | 'CHANGES_REQUESTED'
  | 'COMMENTED'
  | 'DISMISSED'
  | 'PENDING';

export type PullRequestReviewAuthorAssociation =
  | 'COLLABORATOR'
  | 'CONTRIBUTOR'
  | 'FIRST_TIMER'
  | 'FIRST_TIME_CONTRIBUTOR'
  | 'MANNEQUIN'
  | 'MEMBER'
  | 'NONE'
  | 'OWNER';

// TODO: Add explicit types for GitHub API response vs Gitify Notifications object
export type Notification = GitHubNotification & GitifyNotification;

export interface GitHubNotification {
  id: string;
  unread: boolean;
  reason: Reason;
  updated_at: string;
  last_read_at: string | null;
  subject: Subject;
  repository: Repository;
  url: Link;
  subscription_url: Link;
}

// Note: This is not in the official GitHub API. We add this to make notification interactions easier.
export interface GitifyNotification {
  account: Account;
}

export type UserDetails = User & UserProfile;

export interface UserProfile {
  name: string;
  company: string;
  blog: string;
  location: string;
  email: string;
  hireable: string;
  bio: string;
  twitter_username: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  private_gists: number;
  total_private_repos: number;
  owned_private_repos: number;
  disk_usage: number;
  collaborators: number;
  two_factor_authentication: boolean;
  plan: Plan;
}

export interface Plan {
  name: string;
  space: number;
  private_repos: number;
  collaborators: number;
}

export interface User {
  login: string;
  id: number;
  node_id: string;
  avatar_url: Link;
  gravatar_url: Link;
  url: Link;
  html_url: Link;
  followers_url: Link;
  following_url: Link;
  gists_url: Link;
  starred_url: Link;
  subscriptions_url: Link;
  organizations_url: Link;
  repos_url: Link;
  events_url: Link;
  received_events_url: Link;
  type: UserType;
  site_admin: boolean;
}

export interface SubjectUser {
  login: string;
  html_url: Link;
  avatar_url: Link;
  type: UserType;
}

export interface DiscussionAuthor {
  login: string;
  url: Link;
  avatar_url: Link;
  type: UserType;
}

export interface Repository {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
  owner: Owner;
  html_url: Link;
  description: string;
  fork: boolean;
  url: Link;
  forks_url: Link;
  keys_url: Link;
  collaborators_url: Link;
  teams_url: Link;
  hooks_url: Link;
  issue_events_url: Link;
  events_url: Link;
  assignees_url: Link;
  branches_url: Link;
  tags_url: Link;
  blobs_url: Link;
  git_tags_url: Link;
  git_refs_url: Link;
  trees_url: Link;
  statuses_url: Link;
  languages_url: Link;
  stargazers_url: Link;
  contributors_url: Link;
  subscribers_url: Link;
  subscription_url: Link;
  commits_url: Link;
  git_commits_url: Link;
  comments_url: Link;
  issue_comment_url: Link;
  contents_url: Link;
  compare_url: Link;
  merges_url: Link;
  archive_url: Link;
  downloads_url: Link;
  issues_url: Link;
  pulls_url: Link;
  milestones_url: Link;
  notifications_url: Link;
  labels_url: Link;
  releases_url: Link;
  deployments_url: Link;
}

export interface Owner {
  login: string;
  id: number;
  node_id: string;
  avatar_url: Link;
  gravatar_id: string;
  url: Link;
  html_url: Link;
  followers_url: Link;
  following_url: Link;
  gists_url: Link;
  starred_url: Link;
  subscriptions_url: Link;
  organizations_url: Link;
  repos_url: Link;
  events_url: Link;
  received_events_url: Link;
  type: UserType;
  site_admin: boolean;
}

export type Subject = GitHubSubject & GitifySubject;

interface GitHubSubject {
  title: string;
  url: Link | null;
  latest_comment_url: Link | null;
  type: SubjectType;
}

// This is not in the GitHub API, but we add it to the type to make it easier to work with
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

export interface PullRequest {
  url: Link;
  id: number;
  node_id: string;
  html_url: Link;
  diff_url: Link;
  patch_url: Link;
  issue_url: Link;
  number: number;
  state: PullRequestStateType;
  locked: boolean;
  title: string;
  user: User;
  body: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  merge_commit_sha: string | null;
  labels: Labels[];
  milestone: Milestone | null;
  draft: boolean;
  commits_url: Link;
  review_comments_url: Link;
  review_comment_url: Link;
  comments_url: Link;
  statuses_url: Link;
  author_association: string;
  merged: boolean;
  mergeable: boolean;
  rebaseable: boolean;
  comments: number;
  review_comments: number;
  maintainer_can_modify: boolean;
  commits: number;
  additions: number;
  deletions: number;
  changed_files: number;
}

export interface GitifyPullRequestReview {
  state: PullRequestReviewState;
  users: string[];
}

export interface Labels {
  id: number;
  node_id: string;
  url: Link;
  name: string;
  color: string;
  default: boolean;
  description: string;
}

export interface PullRequestReview {
  id: number;
  node_id: string;
  user: User;
  body: string;
  state: PullRequestReviewState;
  html_url: Link;
  pull_request_url: Link;
  author_association: PullRequestReviewAuthorAssociation;
  submitted_at: string;
  commit_id: string;
}

export interface Commit {
  sha: string;
  node_id: string;
  commit: {
    author: CommitUser;
    committer: CommitUser;
    message: string;
    tree: {
      sha: string;
      url: Link;
    };
    url: Link;
    comment_count: number;
    verification: {
      verified: boolean;
      reason: string;
      signature: string | null;
      payload: string | null;
    };
  };
  url: Link;
  html_url: Link;
  comments_url: Link;
  author: User;
  committer: User;
  parents: CommitParent[];
  stats: {
    total: number;
    additions: number;
    deletions: number;
  };
  files: CommitFiles[];
}

interface CommitUser {
  name: string;
  email: string;
  date: string;
}

interface CommitParent {
  sha: string;
  url: Link;
  html_url: Link;
}

interface CommitFiles {
  sha: string;
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  blob_url: Link;
  raw_url: Link;
  contents_url: Link;
  patch: string;
}

export interface CommitComment {
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

export interface Issue {
  url: Link;
  repository_url: Link;
  labels_url: Link;
  comments_url: Link;
  events_url: Link;
  html_url: Link;
  id: number;
  node_id: string;
  number: number;
  title: string;
  user: User;
  state: IssueStateType;
  locked: boolean;
  labels: Labels[];
  milestone: Milestone | null;
  comments: number;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  author_association: string;
  body: string;
  state_reason: IssueStateReasonType | null;
}

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

export interface Milestone {
  url: Link;
  html_url: Link;
  labels_url: Link;
  id: number;
  node_id: string;
  number: number;
  title: string;
  description: string;
  creator: User;
  open_issues: number;
  closed_issues: number;
  state: MilestoneStateType;
  created_at: string;
  updated_at: string;
  due_on: string | null;
  closed_at: string | null;
}

type MilestoneStateType = 'open' | 'closed';

export interface Release {
  url: Link;
  assets_url: Link;
  upload_url: Link;
  html_url: Link;
  id: number;
  author: User;
  node_id: string;
  tag_name: string;
  target_commitish: string;
  name: string | null;
  body: string | null;
  draft: boolean;
  prerelease: boolean;
  created_at: string;
  published_at: string | null;
}

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
  isAnswered: boolean | null;
  url: Link;
  author: DiscussionAuthor;
  comments: DiscussionComments;
  labels: DiscussionLabels | null;
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

export interface GitHubRESTError {
  message: string;
  documentation_url: Link;
}

export interface NotificationThreadSubscription {
  subscribed: boolean;
  ignored: boolean;
  reason: string | null;
  created_at: string;
  url: Link;
  thread_url: Link;
}
