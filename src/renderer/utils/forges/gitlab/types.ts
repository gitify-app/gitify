/**
 * Subset of the GitLab REST API To-Do types.
 *
 * Field names follow the JSON shape returned by the GitLab HTTP API.
 *
 * @see https://docs.gitlab.com/api/todos/
 */

/**
 * Trigger that created the to-do item.
 *
 * @see https://docs.gitlab.com/api/todos/#list-all-to-do-items
 */
export type GitLabTodoActionName =
  | 'assigned'
  | 'mentioned'
  | 'build_failed'
  | 'marked'
  | 'approval_required'
  | 'unmergeable'
  | 'directly_addressed'
  | 'merge_train_removed'
  | 'member_access_requested';

/**
 * Type of the object a to-do item points at. GitLab keeps adding to this list,
 * so consumers must treat unknown values as a fallback rather than exhaustive.
 */
export type GitLabTodoTargetType =
  | 'Issue'
  | 'MergeRequest'
  | 'Commit'
  | 'Epic'
  | 'DesignManagement::Design'
  | 'AlertManagement::Alert'
  | 'Project'
  | 'Namespace'
  | 'Vulnerability'
  | 'WikiPage::Meta';

/** GitLab to-do items are pending until explicitly marked done; there is no read/unread axis. */
export type GitLabTodoState = 'pending' | 'done';

export interface GitLabUser {
  id: number;
  username: string;
  name?: string;
  avatar_url?: string | null;
  web_url?: string;
}

/**
 * Project as embedded in a to-do item.
 *
 * Deliberately narrow: the embedded project omits `web_url` and `avatar_url`
 * that the standalone `/projects/:id` response carries, so the transform
 * derives the repository URL from `path_with_namespace` instead.
 */
export interface GitLabTodoProject {
  id: number;
  name: string;
  name_with_namespace: string;
  path: string;
  path_with_namespace: string;
  description?: string | null;
}

/**
 * The object a to-do item points at, embedded in full by the API.
 *
 * The concrete shape varies by `target_type` (issue, merge request, commit,
 * ...), so this models the fields common to the issue-like targets Gitify
 * renders and leaves the rest optional.
 */
export interface GitLabTodoTarget {
  id?: number;
  iid?: number;
  title?: string;
  state?: string;
  web_url?: string;
  user_notes_count?: number;
  author?: GitLabUser;
  labels?: string[];
  draft?: boolean;
  work_in_progress?: boolean;
  /** Commit targets are keyed by SHA rather than iid. */
  short_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GitLabTodo {
  id: number;
  project?: GitLabTodoProject;
  author?: GitLabUser;
  action_name: GitLabTodoActionName;
  target_type: GitLabTodoTargetType;
  target?: GitLabTodoTarget | null;
  target_url: string;
  body: string;
  state: GitLabTodoState;
  created_at: string;
  updated_at: string;
}

/**
 * Metadata for the token the account authenticates with.
 *
 * GitLab has no equivalent of GitHub's `X-OAuth-Scopes` response header, so
 * scopes come from a dedicated endpoint instead.
 *
 * @see https://docs.gitlab.com/api/personal_access_tokens/
 */
export interface GitLabPersonalAccessToken {
  id: number;
  name: string;
  scopes: string[];
  active: boolean;
  revoked: boolean;
  expires_at: string | null;
}

/**
 * Instance version, used to surface the version of self-managed installations.
 *
 * @see https://docs.gitlab.com/api/version/
 */
export interface GitLabVersion {
  version: string;
  revision: string;
}
