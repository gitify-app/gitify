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

export interface Notification {
  id: string;
  unread: boolean;
  reason: Reason;
  updated_at: string;
  last_read_at: string | null;
  subject: Subject;
  repository: Repository;
  url: string;
  subscription_url: string;
  // TODO - rename this to apiBaseUrl
  hostname: string; // This is not in the official GitHub API. We add this to make notification interactions easier.
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
  avatar_url: string;
  gravatar_url: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: UserType;
  site_admin: boolean;
}

export interface SubjectUser {
  login: string;
  html_url: string;
  avatar_url: string;
  type: UserType;
}

export interface DiscussionAuthor {
  login: string;
  url: string;
  avatar_url: string;
  type: UserType;
}

export interface Repository {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
  owner: Owner;
  html_url: string;
  description: string;
  fork: boolean;
  url: string;
  forks_url: string;
  keys_url: string;
  collaborators_url: string;
  teams_url: string;
  hooks_url: string;
  issue_events_url: string;
  events_url: string;
  assignees_url: string;
  branches_url: string;
  tags_url: string;
  blobs_url: string;
  git_tags_url: string;
  git_refs_url: string;
  trees_url: string;
  statuses_url: string;
  languages_url: string;
  stargazers_url: string;
  contributors_url: string;
  subscribers_url: string;
  subscription_url: string;
  commits_url: string;
  git_commits_url: string;
  comments_url: string;
  issue_comment_url: string;
  contents_url: string;
  compare_url: string;
  merges_url: string;
  archive_url: string;
  downloads_url: string;
  issues_url: string;
  pulls_url: string;
  milestones_url: string;
  notifications_url: string;
  labels_url: string;
  releases_url: string;
  deployments_url: string;
}

export interface Owner {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
}

export type Subject = GitHubSubject & GitifySubject;

interface GitHubSubject {
  title: string;
  url: string | null;
  latest_comment_url: string | null;
  type: SubjectType;
}

// This is not in the GitHub API, but we add it to the type to make it easier to work with
export interface GitifySubject {
  state?: StateType;
  user?: SubjectUser;
  reviews?: GitifyPullRequestReview[];
}

export interface PullRequest {
  url: string;
  id: number;
  node_id: string;
  html_url: string;
  diff_url: string;
  patch_url: string;
  issue_url: string;
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
  draft: boolean;
  commits_url: string;
  review_comments_url: string;
  review_comment_url: string;
  comments_url: string;
  statuses_url: string;
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

export interface PullRequestReview {
  id: number;
  node_id: string;
  user: User;
  body: string;
  state: PullRequestReviewState;
  html_url: string;
  pull_request_url: string;
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
      url: string;
    };
    url: string;
    comment_count: number;
    verification: {
      verified: boolean;
      reason: string;
      signature: string | null;
      payload: string | null;
    };
  };
  url: string;
  html_url: string;
  comments_url: string;
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
  url: string;
  html_url: string;
}

interface CommitFiles {
  sha: string;
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  blob_url: string;
  raw_url: string;
  contents_url: string;
  patch: string;
}

export interface CommitComment {
  url: string;
  html_url: string;
  issue_url: string;
  id: number;
  node_id: string;
  user: User;
  created_at: string;
  updated_at: string;
  body: string;
}

export interface Issue {
  url: string;
  repository_url: string;
  labels_url: string;
  comments_url: string;
  events_url: string;
  html_url: string;
  id: number;
  node_id: string;
  number: number;
  title: string;
  user: User;
  state: IssueStateType;
  locked: boolean;
  comments: number;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  author_association: string;
  body: string;
  state_reason: IssueStateReasonType | null;
}

export interface IssueOrPullRequestComment {
  url: string;
  html_url: string;
  issue_url: string;
  id: number;
  node_id: string;
  user: User;
  created_at: string;
  updated_at: string;
  body: string;
}

export interface Release {
  url: string;
  assets_url: string;
  upload_url: string;
  html_url: string;
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
  url: string;
  author: DiscussionAuthor;
  comments: DiscussionComments;
}

export interface DiscussionComments {
  nodes: DiscussionComment[];
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
  documentation_url: string;
}

export interface NotificationThreadSubscription {
  subscribed: boolean;
  ignored: boolean;
  reason: string | null;
  created_at: string;
  url: string;
  thread_url: string;
}

export interface RootHypermediaLinks {
  current_user_url: string;
  current_user_authorizations_html_url: string;
  authorizations_url: string;
  code_search_url: string;
  commit_search_url: string;
  emails_url: string;
  emojis_url: string;
  events_url: string;
  feeds_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  hub_url: string;
  issue_search_url: string;
  issues_url: string;
  keys_url: string;
  notifications_url: string;
  organization_url: string;
  organization_repositories_url: string;
  organization_teams_url: string;
  public_gists_url: string;
  rate_limit_url: string;
  repository_url: string;
  repository_search_url: string;
  current_user_repositories_url: string;
  starred_url: string;
  starred_gists_url: string;
  topic_search_url: string;
  user_url: string;
  user_organizations_url: string;
  user_repositories_url: string;
  user_search_url: string;
}
