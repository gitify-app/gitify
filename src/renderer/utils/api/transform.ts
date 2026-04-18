import type {
  Account,
  GitifyNotification,
  GitifyNotificationDisplay,
  GitifyOwner,
  GitifyReason,
  GitifyRepository,
  GitifySubject,
  Link,
  Reason,
  SubjectType,
  UserType,
} from '../../types';
import type { GiteaNotificationThread } from './gitea/types';
import type { RawGitHubNotification } from './types';

import { getReasonDetails } from '../notifications/reason';

/**
 * Transform all raw notifications from Atlassian types to Atlassify types.
 *
 * @param rawNotifications - The Atlassian notifications.
 * @param account - The account.
 * @returns Transformed Atlassify notifications.
 */
export function transformNotifications(
  rawNotifications: RawGitHubNotification[],
  account: Account,
): GitifyNotification[] {
  return rawNotifications.map((raw) => {
    return transformNotification(raw, account);
  });
}

/**
 * Transform Gitea API notification threads to GitifyNotification.
 */
export function transformGiteaNotifications(
  rawNotifications: GiteaNotificationThread[],
  account: Account,
): GitifyNotification[] {
  return rawNotifications.map((raw) => {
    return transformGiteaNotification(raw, account);
  });
}

function mapGiteaSubjectType(type: string): SubjectType {
  switch (type) {
    case 'Issue':
      return 'Issue';
    case 'Pull':
      return 'PullRequest';
    case 'Commit':
      return 'Commit';
    case 'Repository':
      return 'Issue';
    default:
      return 'Issue';
  }
}

function transformGiteaNotification(
  raw: GiteaNotificationThread,
  account: Account,
): GitifyNotification {
  const subject = raw.subject;
  const repository = raw.repository;

  const fallbackReason = 'subscribed' as Reason;
  const reasonDetails = getReasonDetails(fallbackReason);

  const placeholderRepo: GitifyRepository = {
    name: 'unknown',
    fullName: 'unknown',
    htmlUrl: `https://${account.hostname}` as Link,
    owner: {
      login: 'unknown',
      avatarUrl: '' as Link,
      type: 'User',
    },
  };

  return {
    id: String(raw.id),
    unread: raw.unread,
    updatedAt: raw.updated_at,
    reason: {
      code: fallbackReason,
      title: reasonDetails.title,
      description: reasonDetails.description ?? '',
    },
    subject: subject
      ? ({
          title: subject.title,
          type: mapGiteaSubjectType(subject.type),
          url: (subject.url || null) as Link | null,
          latestCommentUrl: (subject.latest_comment_url || null) as Link | null,
        } as GitifySubject)
      : ({
          title: '',
          type: 'Issue',
          url: null,
          latestCommentUrl: null,
        } as GitifySubject),
    repository: repository
      ? transformGiteaRepository(repository)
      : placeholderRepo,
    account: account,
    order: 0,
    display: undefined as unknown as GitifyNotificationDisplay,
  };
}

function transformGiteaRepository(
  repo: NonNullable<GiteaNotificationThread['repository']>,
): GitifyRepository {
  const owner = repo.owner;
  return {
    name: repo.name,
    fullName: repo.full_name,
    htmlUrl: repo.html_url as Link,
    owner: {
      login: owner?.login ?? 'unknown',
      avatarUrl: (owner?.avatar_url ?? '') as Link,
      type: 'User',
    },
  };
}

/**
 * Transform a raw GitHub notification to GitifyNotification.
 * Called immediately after REST API response is received.
 *
 * This is the ONLY place where raw GitHub types should be converted
 * to Gitify's internal notification type.
 *
 * @param raw - The GitHub notification.
 * @param account - The account.
 * @returns A transformed Gitify notification.
 */
function transformNotification(
  raw: RawGitHubNotification,
  account: Account,
): GitifyNotification {
  return {
    id: raw.id,
    unread: raw.unread,
    updatedAt: raw.updated_at,
    reason: transformReason(raw.reason),
    subject: transformSubject(raw.subject),
    repository: transformRepository(raw.repository),
    account: account,
    order: 0, // Will be set later in stabilizeNotificationsOrder
    display: undefined as unknown as GitifyNotificationDisplay, // Display fields start as undefined, populated by formatNotification post-enrichment
  };
}

function transformReason(raw: RawGitHubNotification['reason']): GitifyReason {
  const reasonDetails = getReasonDetails(raw as Reason);

  return {
    code: raw as Reason,
    title: reasonDetails.title,
    description: reasonDetails.description ?? '',
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
