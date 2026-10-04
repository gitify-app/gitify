import { type FC, useCallback, useMemo, useState } from 'react';

import { LegendList } from '@legendapp/list/react';

import { useAccountsStore, useSettingsStore } from '../../stores';

import {
  GroupBy,
  type Account,
  type AccountNotifications,
  type GitifyError,
  type GitifyNotification,
} from '../../types';

import { getAccountUUID } from '../../utils/auth/utils';
import { groupNotificationsByRepository } from '../../utils/notifications/group';
import { AllRead } from '../AllRead';
import { Oops } from '../Oops';
import { AccountHeader } from './AccountHeader';
import { NotificationRow } from './NotificationRow';
import { RepositoryHeader } from './RepositoryHeader';

type ListItem =
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

const getItemKey = (item: ListItem) => item.key;
const getItemType = (item: ListItem) => item.kind;

interface BuildItemsContext {
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

export interface NotificationListProps {
  accountNotifications: AccountNotifications[];
  showAccountHeader: boolean;
}

/**
 * Flattened so one virtualizer windows across group boundaries, and so collapse
 * and exit-animation state survives rows unmounting on scroll.
 */
export const NotificationList: FC<NotificationListProps> = ({
  accountNotifications,
  showAccountHeader,
}) => {
  const groupBy = useSettingsStore((s) => s.groupBy);
  const hasMultipleAccounts = useAccountsStore((s) => s.hasMultipleAccounts());

  const [animatingNotifications, setAnimatingNotifications] = useState<ReadonlySet<string>>(
    new Set(),
  );
  const [collapsedAccounts, setCollapsedAccounts] = useState<ReadonlySet<string>>(new Set());
  const [collapsedRepositories, setCollapsedRepositories] = useState<ReadonlySet<string>>(
    new Set(),
  );
  const [animatingRepositories, setAnimatingRepositories] = useState<
    ReadonlyMap<string, ReadonlySet<string>>
  >(new Map());

  const toggleCollapsedAccount = useCallback((accountUUID: string) => {
    setCollapsedAccounts((current) => {
      const next = new Set(current);

      if (!next.delete(accountUUID)) {
        next.add(accountUUID);
      }

      return next;
    });
  }, []);

  const toggleCollapsedRepository = useCallback((repoKey: string) => {
    setCollapsedRepositories((current) => {
      const next = new Set(current);

      if (!next.delete(repoKey)) {
        next.add(repoKey);
      }

      return next;
    });
  }, []);

  const setRepositoryAnimatingExit = useCallback(
    (repoKey: string, notifications: GitifyNotification[], animate: boolean) => {
      setAnimatingRepositories((current) => {
        const next = new Map(current);

        if (animate) {
          next.set(
            repoKey,
            new Set(
              notifications.map(
                (notification) => `${getAccountUUID(notification.account)}:${notification.id}`,
              ),
            ),
          );
        } else {
          next.delete(repoKey);
        }

        return next;
      });
    },
    [],
  );

  const setNotificationAnimatingExit = useCallback((key: string, animate: boolean) => {
    setAnimatingNotifications((current) => {
      const next = new Set(current);
      if (animate) {
        next.add(key);
      } else {
        next.delete(key);
      }
      return next;
    });
  }, []);

  const items = useMemo(() => {
    const context: BuildItemsContext = {
      showAccountHeader,
      hasMultipleAccounts,
      collapsedAccounts,
      collapsedRepositories,
      animatingNotifications,
      animatingRepositories,
      groupBy,
    };

    return accountNotifications.flatMap((item) => buildAccountItems(item, context));
  }, [
    accountNotifications,
    animatingNotifications,
    animatingRepositories,
    collapsedAccounts,
    collapsedRepositories,
    groupBy,
    hasMultipleAccounts,
    showAccountHeader,
  ]);

  return (
    <div className="grow min-h-0 overflow-hidden">
      <LegendList
        className="overflow-y-auto"
        data={items}
        estimatedItemSize={58}
        getItemType={getItemType}
        keyExtractor={getItemKey}
        renderItem={({ item }) => (
          <>
            {item.kind === 'account' && (
              <AccountHeader
                account={item.account}
                error={item.error}
                isCollapsed={collapsedAccounts.has(getAccountUUID(item.account))}
                notificationCount={item.count}
                onToggle={() => toggleCollapsedAccount(getAccountUUID(item.account))}
              />
            )}

            {item.kind === 'error' && <Oops error={item.error} fullHeight={item.fullHeight} />}

            {item.kind === 'all-read' && <AllRead fullHeight={false} />}

            {item.kind === 'repository' && (
              <RepositoryHeader
                isAnimatingExit={animatingRepositories.has(item.repoKey)}
                isCollapsed={collapsedRepositories.has(item.repoKey)}
                onAnimateExit={(animate) =>
                  setRepositoryAnimatingExit(item.repoKey, item.notifications, animate)
                }
                onToggle={() => toggleCollapsedRepository(item.repoKey)}
                repoName={item.repoName}
                repoNotifications={item.notifications}
              />
            )}

            {item.kind === 'notification' && (
              <NotificationRow
                isAnimatingExit={item.isAnimatingExit}
                onAnimateExit={(animate) =>
                  setNotificationAnimatingExit(
                    `${getAccountUUID(item.notification.account)}:${item.notification.id}`,
                    animate,
                  )
                }
                notification={item.notification}
              />
            )}
          </>
        )}
        style={{ height: '100%', overflowX: 'hidden' }}
      />
    </div>
  );
};
