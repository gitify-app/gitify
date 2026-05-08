import {
  type Account,
  type GitifyOwner,
  type GitifyReason,
  type GitifyRepository,
  type GitifySubject,
  type RawGitifyNotification,
  type Reason,
  type SubjectType,
  toLink,
  toLinkOrNull,
  type UserType,
} from '../../../types';
import type { RawGitHubNotification } from './types';

import { getReasonDetails } from '../../notifications/reason';

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
): RawGitifyNotification[] {
  return rawNotifications.map((raw) => {
    return transformNotification(raw, account);
  });
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
): RawGitifyNotification {
  return {
    id: raw.id,
    unread: raw.unread,
    updatedAt: raw.updated_at,
    reason: transformReason(raw.reason),
    subject: transformSubject(raw.subject),
    repository: transformRepository(raw.repository),
    account: account,
    order: 0, // Will be set later in stabilizeNotificationsOrder
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
    url: toLinkOrNull(raw.url),
    latestCommentUrl: toLinkOrNull(raw.latest_comment_url),

    // Enriched fields start as undefined, populated by handlers
  };
}

function transformRepository(
  raw: RawGitHubNotification['repository'],
): GitifyRepository {
  return {
    name: raw.name,
    fullName: raw.full_name,
    htmlUrl: toLink(raw.html_url),
    owner: transformOwner(raw.owner),
  };
}

function transformOwner(
  raw: NonNullable<RawGitHubNotification['repository']['owner']>,
): GitifyOwner {
  return {
    login: raw.login,
    avatarUrl: toLink(raw.avatar_url),
    type: raw.type as UserType,
  };
}
