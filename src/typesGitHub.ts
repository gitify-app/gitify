import type { Account, WebUrl } from './types';

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

export type Notification = GitHubNotification & GitifyNotification;

export interface GitHubNotification {
  id: string;
  unread: boolean;
  reason: Reason;
  updated_at: string;
  last_read_at: string | null;
  subject: Subject;
  repository: Repository;
  url: WebUrl;
  subscription_url: WebUrl;
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
  avatar_url: WebUrl;
  gravatar_url: WebUrl;
  url: WebUrl;
  html_url: WebUrl;
  followers_url: WebUrl;
  following_url: WebUrl;
  gists_url: WebUrl;
  starred_url: WebUrl;
  subscriptions_url: WebUrl;
  organizations_url: WebUrl;
  repos_url: WebUrl;
  events_url: WebUrl;
  received_events_url: WebUrl;
  type: UserType;
  site_admin: boolean;
}

export interface SubjectUser {
  login: string;
  html_url: WebUrl;
  avatar_url: WebUrl;
  type: UserType;
}

export interface DiscussionAuthor {
  login: string;
  url: WebUrl;
  avatar_url: WebUrl;
  type: UserType;
}

export interface Repository {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
  owner: Owner;
  html_url: WebUrl;
  description: string;
  fork: boolean;
  url: WebUrl;
  forks_url: WebUrl;
  keys_url: WebUrl;
  collaborators_url: WebUrl;
  teams_url: WebUrl;
  hooks_url: WebUrl;
  issue_events_url: WebUrl;
  events_url: WebUrl;
  assignees_url: WebUrl;
  branches_url: WebUrl;
  tags_url: WebUrl;
  blobs_url: WebUrl;
  git_tags_url: WebUrl;
  git_refs_url: WebUrl;
  trees_url: WebUrl;
  statuses_url: WebUrl;
  languages_url: WebUrl;
  stargazers_url: WebUrl;
  contributors_url: WebUrl;
  subscribers_url: WebUrl;
  subscription_url: WebUrl;
  commits_url: WebUrl;
  git_commits_url: WebUrl;
  comments_url: WebUrl;
  issue_comment_url: WebUrl;
  contents_url: WebUrl;
  compare_url: WebUrl;
  merges_url: WebUrl;
  archive_url: WebUrl;
  downloads_url: WebUrl;
  issues_url: WebUrl;
  pulls_url: WebUrl;
  milestones_url: WebUrl;
  notifications_url: WebUrl;
  labels_url: WebUrl;
  releases_url: WebUrl;
  deployments_url: WebUrl;
}

export interface Owner {
  login: string;
  id: number;
  node_id: string;
  avatar_url: WebUrl;
  gravatar_id: string;
  url: WebUrl;
  html_url: WebUrl;
  followers_url: WebUrl;
  following_url: WebUrl;
  gists_url: WebUrl;
  starred_url: WebUrl;
  subscriptions_url: WebUrl;
  organizations_url: WebUrl;
  repos_url: WebUrl;
  events_url: WebUrl;
  received_events_url: WebUrl;
  type: string;
  site_admin: boolean;
}

export type Subject = GitHubSubject & GitifySubject;

interface GitHubSubject {
  title: string;
  url: WebUrl | null;
  latest_comment_url: WebUrl | null;
  type: SubjectType;
}

// This is not in the GitHub API, but we add it to the type to make it easier to work with
export interface GitifySubject {
  state?: StateType;
  user?: SubjectUser;
  reviews?: GitifyPullRequestReview[];
  linkedIssues?: string[];
  comments?: number;
  labels?: string[];
  milestone?: Milestone;
}

export interface PullRequest {
  url: WebUrl;
  id: number;
  node_id: string;
  html_url: WebUrl;
  diff_url: WebUrl;
  patch_url: WebUrl;
  issue_url: WebUrl;
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
  commits_url: WebUrl;
  review_comments_url: WebUrl;
  review_comment_url: WebUrl;
  comments_url: WebUrl;
  statuses_url: WebUrl;
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
  url: WebUrl;
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
  html_url: WebUrl;
  pull_request_url: WebUrl;
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
      url: WebUrl;
    };
    url: WebUrl;
    comment_count: number;
    verification: {
      verified: boolean;
      reason: string;
      signature: string | null;
      payload: string | null;
    };
  };
  url: WebUrl;
  html_url: WebUrl;
  comments_url: WebUrl;
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
  url: WebUrl;
  html_url: WebUrl;
}

interface CommitFiles {
  sha: string;
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  blob_url: WebUrl;
  raw_url: WebUrl;
  contents_url: WebUrl;
  patch: string;
}

export interface CommitComment {
  url: WebUrl;
  html_url: WebUrl;
  issue_url: WebUrl;
  id: number;
  node_id: string;
  user: User;
  created_at: string;
  updated_at: string;
  body: string;
}

export interface Issue {
  url: WebUrl;
  repository_url: WebUrl;
  labels_url: WebUrl;
  comments_url: WebUrl;
  events_url: WebUrl;
  html_url: WebUrl;
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
  url: WebUrl;
  html_url: WebUrl;
  issue_url: WebUrl;
  id: number;
  node_id: string;
  user: User;
  created_at: string;
  updated_at: string;
  body: string;
}

export interface Milestone {
  url: WebUrl;
  html_url: WebUrl;
  labels_url: WebUrl;
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
  url: WebUrl;
  assets_url: WebUrl;
  upload_url: WebUrl;
  html_url: WebUrl;
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
  title: string;
  stateReason: DiscussionStateType;
  isAnswered: boolean;
  url: WebUrl;
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
  documentation_url: WebUrl;
}

export interface NotificationThreadSubscription {
  subscribed: boolean;
  ignored: boolean;
  reason: string | null;
  created_at: string;
  url: WebUrl;
  thread_url: WebUrl;
}
