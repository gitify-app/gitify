export type Reason =
  | 'assign'
  | 'author'
  | 'comment'
  | 'invitation'
  | 'manual'
  | 'mention'
  | 'review_requested'
  | 'security_alert'
  | 'state_change'
  | 'subscribed'
  | 'team_mention'
  | 'ci_activity';

export type SubjectType =
  | 'CheckSuite'
  | 'Commit'
  | 'Discussion'
  | 'Issue'
  | 'PullRequest'
  | 'Release'
  | 'RepositoryVulnerabilityAlert';

export type ViewerSubscription =
  | 'IGNORED'
  | 'SUBSCRIBED'
  | 'UNSUBSCRIBED'

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
  url?: string;
  latest_comment_url?: string;
  type: SubjectType;
}

export interface GraphQLSearch {
  data: {
    data: {
      search: {
        edges: DiscussionEdge[]
      }
    }
  }
}

export interface DiscussionEdge {
  node: {
    viewerSubscription: ViewerSubscription;
    title: string;
    url: string;
    comments: {
      edges: DiscussionCommentEdge[]
    }
  }
}

export interface DiscussionCommentEdge {
  node: {
    databaseId: string|number;
    createdAt: string;
    replies: {
      edges: DiscussionSubcommentEdge[]
    }
  }
}

export interface DiscussionSubcommentEdge {
  node: {
    databaseId: string|number;
    createdAt: string;
  }
}
