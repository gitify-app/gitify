import {
  GroupBy,
  type Account,
  type AccountNotifications,
  type GitifyError,
  type GitifyNotification,
} from '../../types';

import { getAccountUUID } from '../auth/utils';
import { groupNotificationsByRepository } from './group';

export type ListItem =
  | { key: string; kind: 'account'; account: Account; error: GitifyError | null; count: number }
  | { key: string; kind: 'error'; error: GitifyError; fullHeight: boolean }
  | { key: string; kind: 'all-read' }
  | {
      key: string;
      kind: 'repository';
      repoKey: string;
      repoName: string;
      notifications: GitifyNotification[];
    }
  | {
      key: string;
      kind: 'notification';
      notification: GitifyNotification;
      isAnimatingExit: boolean;
    };

export const getItemKey = (item: ListItem) => item.key;
export const getItemType = (item: ListItem) => item.kind;

export interface BuildItemsContext {
  showAccountHeader: boolean;
  hasMultipleAccounts: boolean;
  collapsedAccounts: ReadonlySet<string>;
  collapsedRepositories: ReadonlySet<string>;
  animatingNotifications: ReadonlySet<string>;
  animatingRepositories: ReadonlyMap<string, ReadonlySet<string>>;
  groupBy: GroupBy;
}

function getNotificationExitKey(accountUUID: string, notification: GitifyNotification): string {
  return `${accountUUID}:${notification.id}`;
}

function buildNotificationItem(
  accountUUID: string,
  notification: GitifyNotification,
  isAnimatingExit: boolean,
): ListItem {
  return {
    key: `notification-${accountUUID}:${notification.id}`,
    kind: 'notification',
    notification,
    isAnimatingExit,
  };
}

export function buildRepositoryItems(
  accountUUID: string,
  sorted: GitifyNotification[],
  context: BuildItemsContext,
): ListItem[] {
  const items: ListItem[] = [];

  for (const [repoName, repoNotifications] of groupNotificationsByRepository(sorted)) {
    const repoKey = `${accountUUID}-${repoName}`;

    items.push({
      key: `repository-${repoKey}`,
      kind: 'repository',
      repoKey,
      repoName,
      notifications: repoNotifications,
    });

    if (context.collapsedRepositories.has(repoKey)) {
      continue;
    }

    for (const notification of repoNotifications) {
      const exitKey = getNotificationExitKey(accountUUID, notification);
      items.push(
        buildNotificationItem(
          accountUUID,
          notification,
          context.animatingNotifications.has(exitKey) ||
            (context.animatingRepositories.get(repoKey)?.has(exitKey) ?? false),
        ),
      );
    }
  }

  return items;
}

export function buildAccountItems(
  { account, error, notifications }: AccountNotifications,
  context: BuildItemsContext,
): ListItem[] {
  const accountUUID = getAccountUUID(account);
  const items: ListItem[] = [];

  if (context.showAccountHeader) {
    items.push({
      key: `account-${accountUUID}`,
      kind: 'account',
      account,
      error,
      count: notifications.length,
    });
  }

  if (context.collapsedAccounts.has(accountUUID)) {
    return items;
  }

  if (error) {
    items.push({
      key: `error-${accountUUID}`,
      kind: 'error',
      error,
      fullHeight: !context.hasMultipleAccounts,
    });
  } else if (notifications.length === 0) {
    items.push({ key: `all-read-${accountUUID}`, kind: 'all-read' });
  }

  const sorted = [...notifications].sort((a, b) => a.order - b.order);

  if (context.groupBy !== GroupBy.REPOSITORY) {
    for (const notification of sorted) {
      items.push(
        buildNotificationItem(
          accountUUID,
          notification,
          context.animatingNotifications.has(getNotificationExitKey(accountUUID, notification)),
        ),
      );
    }

    return items;
  }

  items.push(...buildRepositoryItems(accountUUID, sorted, context));

  return items;
}
