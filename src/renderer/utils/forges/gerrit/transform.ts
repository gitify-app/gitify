import {
  type Account,
  type GitifyNotificationUser,
  type GitifyPullRequestState,
  type GitifyRepository,
  type GitifySubject,
  type RawGitifyNotification,
  type Reason,
  toLink,
} from '../../../types';
import type { GerritAccountInfo, GerritChangeInfo } from './types';

import { getReasonDetails } from '../../notifications/reason';

// A Gerrit change is only ever returned by the `attention:self` query while
// the caller is expected to act on it: on someone else's change that means
// "review requested"; on the caller's own change, a reviewer is waiting on them.
function getReason(raw: GerritChangeInfo, account: Account): Reason {
  return String(raw.owner?._account_id) === account.user?.id ? 'author' : 'review_requested';
}

export function transformGerritChanges(
  raw: GerritChangeInfo[],
  account: Account,
): RawGitifyNotification[] {
  return raw.map((change) => transformGerritChange(change, account));
}

function transformGerritChange(raw: GerritChangeInfo, account: Account): RawGitifyNotification {
  const reason = getReason(raw, account);
  const reasonDetails = getReasonDetails(reason);

  return {
    id: raw.id,
    // Every result of the `attention:self` query is, by definition, a change
    // still awaiting the caller's attention — there is no "read but still
    // listed" state in this model. Removing the account from the attention
    // set (`markThreadAsRead`) is what makes an entry disappear.
    unread: true,
    updatedAt: toIsoTimestamp(raw.updated),
    reason: {
      code: reason,
      title: reasonDetails.title,
      description: reasonDetails.description ?? '',
    },
    subject: transformSubject(raw, account),
    repository: transformRepository(raw, account),
    account,
    order: 0,
  };
}

function transformSubject(raw: GerritChangeInfo, account: Account): GitifySubject {
  return {
    title: raw.subject,
    // Reuses GitHub's vocabulary (same precedent as Gitea mapping "Pull" ->
    // 'PullRequest') so the shared icon/state-filter/type-filter code applies
    // without any Gerrit-specific branching outside this adapter.
    type: 'PullRequest',
    url: toLink(buildChangeApiUrl(account, raw)),
    latestCommentUrl: null,
    number: raw._number,
    state: mapState(raw),
    htmlUrl: toLink(buildChangeWebUrl(account, raw)),
    author: mapAccount(raw.owner, account),
    user: mapAccount(raw.owner, account),
  };
}

function mapState(raw: GerritChangeInfo): GitifyPullRequestState {
  if (raw.status === 'MERGED') {
    return 'MERGED';
  }
  if (raw.status === 'ABANDONED') {
    return 'CLOSED';
  }
  return raw.work_in_progress ? 'DRAFT' : 'OPEN';
}

function transformRepository(raw: GerritChangeInfo, account: Account): GitifyRepository {
  // Gerrit projects can be nested (e.g. "platform/frameworks/base"). There is
  // no user/org "owner" concept the way GitHub has one, so the namespace
  // prefix (if any) is used as a best-effort grouping for the UI.
  const segments = raw.project.split('/');
  const name = segments.at(-1) || raw.project;
  const ownerLogin = segments.length > 1 ? segments.slice(0, -1).join('/') : raw.project;

  return {
    name,
    fullName: raw.project,
    htmlUrl: toLink(`https://${account.hostname}/admin/repos/${encodeURIComponent(raw.project)}`),
    owner: {
      login: ownerLogin,
      avatarUrl: toLink(''),
      type: 'Organization',
    },
  };
}

function mapAccount(
  owner: GerritAccountInfo | undefined,
  account: Account,
): GitifyNotificationUser | undefined {
  if (!owner) {
    return undefined;
  }

  const login = owner.username ?? owner.name ?? owner.email ?? String(owner._account_id);
  const profileUrl = owner.username
    ? `https://${account.hostname}/q/owner:${encodeURIComponent(owner.username)}`
    : `https://${account.hostname}`;

  return {
    login,
    avatarUrl: toLink(owner.avatars?.[0]?.url ?? ''),
    htmlUrl: toLink(profileUrl),
    type: 'User',
  };
}

function buildChangeWebUrl(account: Account, raw: GerritChangeInfo): string {
  return `https://${account.hostname}/c/${encodeURIComponent(raw.project)}/+/${raw._number}`;
}

function buildChangeApiUrl(account: Account, raw: GerritChangeInfo): string {
  return `https://${account.hostname}/a/changes/${encodeURIComponent(raw.project)}~${raw._number}`;
}

/**
 * Convert a Gerrit timestamp (`"yyyy-MM-dd HH:mm:ss.fffffffff"`, always UTC)
 * into an ISO-8601 string so shared code (sorting, relative-time display)
 * can parse it with `new Date(...)`.
 */
export function toIsoTimestamp(gerritTimestamp: string): string {
  const [datePart, timePart = ''] = gerritTimestamp.split(' ');
  const [seconds, fractional = ''] = timePart.split('.');
  const milliseconds = fractional.slice(0, 3).padEnd(3, '0');
  return `${datePart}T${seconds}.${milliseconds}Z`;
}
