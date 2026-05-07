import {
  type Account,
  type GitifyNotification,
  type GitifyRepository,
  type GitifySubject,
  type Reason,
  type SubjectType,
  toLink,
  toLinkOrNull,
} from '../../../types';
import type { GiteaNotificationThread, GiteaNotifySubjectType } from './types';

import { getReasonDetails } from '../../notifications/reason';

const FALLBACK_REASON: Reason = 'subscribed';

export function transformGiteaNotifications(
  raw: GiteaNotificationThread[],
  account: Account,
): GitifyNotification[] {
  return raw.map((thread) => transformGiteaNotification(thread, account));
}

function transformGiteaNotification(
  raw: GiteaNotificationThread,
  account: Account,
): GitifyNotification {
  const reasonDetails = getReasonDetails(FALLBACK_REASON);

  return {
    id: String(raw.id),
    unread: raw.unread,
    updatedAt: raw.updated_at,
    reason: {
      code: FALLBACK_REASON,
      title: reasonDetails.title,
      description: reasonDetails.description ?? '',
    },
    subject: transformSubject(raw),
    repository: transformRepository(raw, account),
    account,
    order: 0,
    // `display` is populated by formatNotification post-enrichment.
  };
}

function transformSubject(raw: GiteaNotificationThread): GitifySubject {
  if (!raw.subject) {
    return {
      title: '',
      type: 'Issue',
      url: null,
      latestCommentUrl: null,
    };
  }

  return {
    title: raw.subject.title,
    type: mapSubjectType(raw.subject.type),
    url: toLinkOrNull(raw.subject.url),
    latestCommentUrl: toLinkOrNull(raw.subject.latest_comment_url),
  };
}

function transformRepository(
  raw: GiteaNotificationThread,
  account: Account,
): GitifyRepository {
  if (!raw.repository) {
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

  return {
    name: raw.repository.name,
    fullName: raw.repository.full_name,
    htmlUrl: toLink(raw.repository.html_url),
    owner: {
      login: raw.repository.owner?.login ?? 'unknown',
      avatarUrl: toLink(raw.repository.owner?.avatar_url ?? ''),
      type: 'User',
    },
  };
}

function mapSubjectType(type: GiteaNotifySubjectType): SubjectType {
  switch (type) {
    case 'Pull':
      return 'PullRequest';
    case 'Issue':
      return 'Issue';
    case 'Commit':
      return 'Commit';
    default:
      return 'Issue';
  }
}
