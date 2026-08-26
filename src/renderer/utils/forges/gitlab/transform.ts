import {
  type Account,
  type GitifyNotificationState,
  type GitifyNotificationUser,
  type GitifyReason,
  type GitifyRepository,
  type GitifySubject,
  type RawGitifyNotification,
  type Reason,
  type SubjectType,
  toLink,
} from '../../../types';
import type {
  GitLabTodo,
  GitLabTodoActionName,
  GitLabTodoTarget,
  GitLabTodoTargetType,
  GitLabUser,
  KnownGitLabTodoActionName,
  KnownGitLabTodoTargetType,
} from './types';

import { getReasonDetails } from '../../notifications/reason';

const FALLBACK_REASON: Reason = 'subscribed';

/**
 * GitLab's to-do triggers map onto Gitify reason codes, so unlike Gitea we can
 * surface a meaningful reason rather than a blanket "subscribed".
 *
 * @see https://docs.gitlab.com/api/todos/#list-all-to-do-items
 */
const ACTION_REASON_MAP: Record<KnownGitLabTodoActionName, Reason> = {
  assigned: 'assign',
  mentioned: 'mention',
  directly_addressed: 'mention',
  build_failed: 'ci_activity',
  marked: 'manual',
  approval_required: 'approval_requested',
  unmergeable: 'state_change',
  merge_train_removed: 'state_change',
  member_access_requested: 'member_feature_requested',
  review_requested: 'review_requested',
  review_submitted: 'comment',
};

function isKnownAction(action: string): action is KnownGitLabTodoActionName {
  return action in ACTION_REASON_MAP;
}

/**
 * Only the target types Gitify renders natively get a dedicated subject type.
 * Everything else (epics, designs, alerts, vulnerabilities, wiki pages) falls
 * back to `GitLabTodo` so the filter UI stays honest about what it is showing.
 */
const TARGET_SUBJECT_TYPE_MAP: Record<string, SubjectType | undefined> = {
  Issue: 'Issue',
  MergeRequest: 'PullRequest',
  Commit: 'Commit',
} satisfies Partial<Record<KnownGitLabTodoTargetType, SubjectType>>;

export function transformGitLabTodos(raw: GitLabTodo[], account: Account): RawGitifyNotification[] {
  return raw.map((todo) => transformGitLabTodo(todo, account));
}

function transformGitLabTodo(raw: GitLabTodo, account: Account): RawGitifyNotification {
  return {
    id: String(raw.id),
    // GitLab has no read/unread axis — a to-do item is either pending or done.
    unread: raw.state === 'pending',
    updatedAt: raw.updated_at,
    reason: mapReason(raw.action_name),
    subject: transformSubject(raw, account),
    repository: transformRepository(raw, account),
    account,
    order: 0,
  };
}

function mapReason(action: GitLabTodoActionName): GitifyReason {
  const code = isKnownAction(action) ? ACTION_REASON_MAP[action] : FALLBACK_REASON;
  const details = getReasonDetails(code);
  return {
    code,
    title: details.title,
    description: details.description ?? '',
  };
}

/**
 * Build the subject from the to-do item.
 *
 * The GitLab to-do payload embeds the full target object, so the enriched
 * fields (state, author, comment count) come from the list response and the
 * adapter needs no separate enrichment pass.
 */
function transformSubject(raw: GitLabTodo, account: Account): GitifySubject {
  const target = raw.target;

  return {
    title: target?.title ?? raw.body,
    type: TARGET_SUBJECT_TYPE_MAP[raw.target_type] ?? 'GitLabTodo',
    // GitLab to-do items carry a web URL for the target, not an API one, and
    // there is no latest-comment pointer to follow.
    url: null,
    latestCommentUrl: null,
    htmlUrl: toLink(raw.target_url || repositoryUrl(raw, account)),
    number: target?.iid,
    state: mapState(raw.target_type, target),
    // The to-do's own author is whoever triggered it (assigned you, mentioned
    // you), which is the actor the row should show. The target's author is
    // whoever opened the thread, which is a different person in every case
    // except self-assignment.
    user: transformUser(raw.author),
    author: transformUser(target?.author),
    commentCount: target?.user_notes_count,
  };
}

function mapState(
  targetType: GitLabTodoTargetType,
  target: GitLabTodoTarget | null,
): GitifyNotificationState | undefined {
  if (!target?.state) {
    return undefined;
  }

  if (targetType === 'MergeRequest') {
    switch (target.state) {
      case 'opened':
        // Draft only qualifies an open merge request. GitLab derives the flag
        // from the `Draft:` title prefix, which survives closing, so checking
        // it first would report a closed draft as still in progress.
        return target.draft || target.work_in_progress ? 'DRAFT' : 'OPEN';
      case 'closed':
        return 'CLOSED';
      case 'merged':
        return 'MERGED';
      default:
        return undefined;
    }
  }

  switch (target.state) {
    case 'opened':
      return 'OPEN';
    case 'closed':
      return 'CLOSED';
    default:
      return undefined;
  }
}

function transformUser(user: GitLabUser | undefined): GitifyNotificationUser | undefined {
  if (!user) {
    return undefined;
  }

  return {
    login: user.username,
    name: user.name ?? null,
    avatarUrl: toLink(user.avatar_url ?? ''),
    htmlUrl: toLink(user.web_url ?? ''),
    type: 'User',
  };
}

/**
 * Web URL for the to-do's project.
 *
 * The project embedded in a to-do item omits the `web_url` that the standalone
 * project endpoint returns, so it is derived from `path_with_namespace` against
 * the account's hostname. Doubles as the fallback deep link when a to-do
 * arrives without a `target_url`.
 */
function repositoryUrl(raw: GitLabTodo, account: Account): string {
  const path = raw.project?.path_with_namespace;
  return path ? `https://${account.hostname}/${path}` : `https://${account.hostname}`;
}

/** Build the repository from the embedded project. */
function transformRepository(raw: GitLabTodo, account: Account): GitifyRepository {
  const project = raw.project;

  if (!project) {
    return {
      name: 'unknown',
      fullName: 'unknown',
      htmlUrl: toLink(repositoryUrl(raw, account)),
      owner: {
        login: 'unknown',
        avatarUrl: toLink(''),
        type: 'User',
      },
    };
  }

  const fullName = project.path_with_namespace;
  const owner = fullName.includes('/') ? fullName.slice(0, fullName.lastIndexOf('/')) : fullName;

  return {
    name: project.path,
    fullName,
    htmlUrl: toLink(repositoryUrl(raw, account)),
    owner: {
      login: owner,
      avatarUrl: toLink(''),
      type: 'User',
    },
  };
}
