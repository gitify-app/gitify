import type {
  Account,
  GitifyNotification,
  GitifyOwner,
  GitifyRepository,
  GitifySubject,
  Link,
  Reason,
  SubjectType,
  UserType,
} from '../../types';
import type { RawGitHubNotification } from './types';

/**
 * Transform a raw GitHub notification to GitifyNotification.
 * Called immediately after REST API response is received.
 *
 * This is the ONLY place where raw GitHub types should be converted
 * to Gitify's internal notification type.
 */
export function transformNotification(
  raw: RawGitHubNotification,
  account: Account,
  order = 0,
): GitifyNotification {
  return {
    id: raw.id,
    unread: raw.unread,
    updatedAt: raw.updated_at,
    reason: raw.reason as Reason,
    subject: transformSubject(raw.subject),
    repository: transformRepository(raw.repository),
    account,
    order,
  };
}

function transformSubject(
  raw: RawGitHubNotification['subject'],
): GitifySubject {
  return {
    title: raw.title,
    type: raw.type as SubjectType,
    url: raw.url as Link | null,
    latestCommentUrl: raw.latest_comment_url as Link | null,
    // Enriched fields start as undefined, populated by handlers
  };
}

function transformRepository(
  raw: RawGitHubNotification['repository'],
): GitifyRepository {
  return {
    name: raw.name,
    fullName: raw.full_name,
    htmlUrl: raw.html_url as Link,
    owner: transformOwner(raw.owner),
  };
}

function transformOwner(
  raw: NonNullable<RawGitHubNotification['repository']['owner']>,
): GitifyOwner {
  return {
    login: raw.login,
    avatarUrl: raw.avatar_url as Link,
    type: raw.type as UserType,
  };
}
