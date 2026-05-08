import type {
  Account,
  GitifyReason,
  GitifyRepository,
  GitifySubject,
  RawGitifyNotification,
  Reason,
} from '../../../types';
import { toLink } from '../../../types';
import type { AtlassianNotificationFragment } from './types';

import { getReasonDetails } from '../../notifications/reason';
import { InfluentsNotificationCategory } from './graphql/generated/graphql';

const CATEGORY_REASON_MAP: Record<InfluentsNotificationCategory, Reason> = {
  [InfluentsNotificationCategory.Direct]: 'assign',
  [InfluentsNotificationCategory.Watching]: 'subscribed',
};

function mapCategoryToReason(
  category: InfluentsNotificationCategory,
): GitifyReason {
  const code: Reason = CATEGORY_REASON_MAP[category] ?? 'subscribed';
  const details = getReasonDetails(code);
  return {
    code,
    title: details.title,
    description: details.description ?? '',
  };
}

/**
 * Extract the repository "owner/repo" from a Bitbucket entity URL.
 *
 * Bitbucket entity URLs look like:
 *   https://bitbucket.org/myorg/myrepo/pull-requests/42
 *
 * Returns "myorg/myrepo" or a fallback when the URL can't be parsed.
 */
function extractRepositoryName(entityUrl: string | null | undefined): string {
  if (!entityUrl) {
    return 'bitbucket';
  }
  const parts = entityUrl.split('/');
  // parts[0] = 'https:', [1] = '', [2] = 'bitbucket.org', [3] = owner, [4] = repo
  if (parts.length >= 5) {
    return `${parts[3]}/${parts[4]}`;
  }
  return 'bitbucket';
}

function transformSubject(raw: AtlassianNotificationFragment): GitifySubject {
  const content = raw.headNotification.content;
  const entityUrl = content.entity?.url ?? content.url ?? null;
  return {
    title: content.entity?.title ?? content.message,
    type: 'BitbucketNotification',
    url: entityUrl ? toLink(entityUrl) : null,
    latestCommentUrl: null,
    htmlUrl: entityUrl ? toLink(entityUrl) : undefined,
  };
}

function transformRepository(
  raw: AtlassianNotificationFragment,
  _account: Account,
): GitifyRepository {
  const content = raw.headNotification.content;
  const entityUrl = content.entity?.url ?? content.url ?? null;
  const fullName = extractRepositoryName(entityUrl);
  const [owner] = fullName.split('/');

  const repoUrl =
    entityUrl?.split('/').slice(0, 5).join('/') ??
    `https://bitbucket.org/${fullName}`;

  return {
    name: fullName.split('/')[1] ?? fullName,
    fullName,
    htmlUrl: toLink(repoUrl),
    owner: {
      login: owner,
      avatarUrl: toLink(`https://bitbucket.org/${owner}/avatar`),
      type: 'Organization',
    },
  };
}

export function transformBitbucketNotifications(
  raw: AtlassianNotificationFragment[],
  account: Account,
): RawGitifyNotification[] {
  return raw.map((notification) =>
    transformBitbucketNotification(notification, account),
  );
}

function transformBitbucketNotification(
  raw: AtlassianNotificationFragment,
  account: Account,
): RawGitifyNotification {
  const head = raw.headNotification;

  return {
    id: head.notificationId,
    unread: head.readState === 'unread',
    updatedAt: head.timestamp,
    reason: mapCategoryToReason(head.category),
    subject: transformSubject(raw),
    repository: transformRepository(raw, account),
    account,
    order: 0,
  };
}
