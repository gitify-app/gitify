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

export type ViewerSubscription = 'IGNORED' | 'SUBSCRIBED' | 'UNSUBSCRIBED';

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
}

export interface User {
  login: string;
  name: string;
  id: number;
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

export interface Subject {
  title: string;
  url: string | null;
  state?: StateType; // This is not in the GitHub API, but we add it to the type to make it easier to work with
  latest_comment_url: string | null;
  type: SubjectType;
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

export interface IssueComments {
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

export interface GraphQLSearch<T> {
  data: {
    data: {
      search: {
        nodes: T[];
      };
    };
  };
}

export interface DiscussionStateSearchResultNode {
  viewerSubscription: ViewerSubscription;
  title: string;
  stateReason: DiscussionStateType;
  isAnswered: boolean;
}

export interface DiscussionSearchResultNode {
  viewerSubscription: ViewerSubscription;
  title: string;
  url: string;
  comments: {
    nodes: DiscussionCommentNode[];
  };
}

export interface DiscussionCommentNode {
  databaseId: string | number;
  createdAt: string;
  replies: {
    nodes: DiscussionSubcommentNode[];
  };
}

export interface DiscussionSubcommentNode {
  databaseId: string | number;
  createdAt: string;
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
