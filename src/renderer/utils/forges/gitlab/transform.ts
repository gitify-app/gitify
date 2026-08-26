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
} from './types';

import { getReasonDetails } from '../../notifications/reason';

const FALLBACK_REASON: Reason = 'subscribed';

/**
 * GitLab's to-do triggers map onto Gitify reason codes, so unlike Gitea we can
 * surface a meaningful reason rather than a blanket "subscribed".
 *
 * @see https://docs.gitlab.com/api/todos/#list-all-to-do-items
 */
const ACTION_REASON_MAP: Record<GitLabTodoActionName, Reason> = {
  assigned: 'assign',
  mentioned: 'mention',
  directly_addressed: 'mention',
  build_failed: 'ci_activity',
  marked: 'manual',
  approval_required: 'approval_requested',
  unmergeable: 'state_change',
  merge_train_removed: 'state_change',
  member_access_requested: 'member_feature_requested',
};

/**
 * Only the target types Gitify renders natively get a dedicated subject type.
 * Everything else (epics, designs, alerts, vulnerabilities, wiki pages) falls
 * back to `GitLabTodo` so the filter UI stays honest about what it is showing.
 */
const TARGET_SUBJECT_TYPE_MAP: Partial<Record<GitLabTodoTargetType, SubjectType>> = {
  Issue: 'Issue',
  MergeRequest: 'PullRequest',
  Commit: 'Commit',
};

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
    subject: transformSubject(raw),
    repository: transformRepository(raw, account),
    account,
    order: 0,
  };
}

function mapReason(action: GitLabTodoActionName): GitifyReason {
  const code = ACTION_REASON_MAP[action] ?? FALLBACK_REASON;
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
function transformSubject(raw: GitLabTodo): GitifySubject {
  const target = raw.target ?? undefined;
  const user = transformUser(target?.author);

  return {
    title: target?.title ?? raw.body,
    type: TARGET_SUBJECT_TYPE_MAP[raw.target_type] ?? 'GitLabTodo',
    // GitLab to-do items carry a web URL for the target, not an API one, and
    // there is no latest-comment pointer to follow.
    url: null,
    latestCommentUrl: null,
    htmlUrl: toLink(raw.target_url),
    number: target?.iid,
    state: mapState(raw.target_type, target),
    user,
    author: user,
    commentCount: target?.user_notes_count,
  };
}

function mapState(
  targetType: GitLabTodoTargetType,
  target: GitLabTodoTarget | undefined,
): GitifyNotificationState | undefined {
  if (!target?.state) {
    return undefined;
  }

  if (targetType === 'MergeRequest') {
    if (target.draft || target.work_in_progress) {
      return 'DRAFT';
    }
    switch (target.state) {
      case 'opened':
        return 'OPEN';
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
 * Build the repository from the embedded project.
 *
 * The project embedded in a to-do item omits `web_url` and `avatar_url` that
 * the standalone project endpoint returns, so the repository URL is derived
 * from `path_with_namespace` against the account's hostname.
 */
function transformRepository(raw: GitLabTodo, account: Account): GitifyRepository {
  const project = raw.project;

  if (!project) {
    return {
      name: 'unknown',
      fullName: 'unknown',
      htmlUrl: toLink(`https://${account.hostname}`),
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
    htmlUrl: toLink(`https://${account.hostname}/${fullName}`),
    owner: {
      login: owner,
      avatarUrl: toLink(''),
      type: 'User',
    },
  };
}
