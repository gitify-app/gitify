import { type FC, useCallback, useMemo, useState } from 'react';

import { LegendList } from '@legendapp/list/react';

import { useAccountsStore, useSettingsStore } from '../../stores';

import type { Account, AccountNotifications, GitifyError, GitifyNotification } from '../../types';

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
    const list: ListItem[] = [];

    for (const { account, error, notifications } of accountNotifications) {
      const accountUUID = getAccountUUID(account);

      if (showAccountHeader) {
        list.push({
          key: `account-${accountUUID}`,
          kind: 'account',
          account,
          error,
          count: notifications.length,
        });
      }

      if (collapsedAccounts.has(accountUUID)) {
        continue;
      }

      if (error) {
        list.push({
          key: `error-${accountUUID}`,
          kind: 'error',
          error,
          fullHeight: !hasMultipleAccounts,
        });
      } else if (notifications.length === 0) {
        list.push({ key: `all-read-${accountUUID}`, kind: 'all-read' });
      }

      const sorted = [...notifications].sort((a, b) => a.order - b.order);

      if (groupBy !== 'REPOSITORY') {
        for (const notification of sorted) {
          list.push({
            key: `notification-${accountUUID}:${notification.id}`,
            kind: 'notification',
            notification,
            isAnimatingExit: animatingNotifications.has(`${accountUUID}:${notification.id}`),
          });
        }

        continue;
      }

      for (const [repoName, repoNotifications] of groupNotificationsByRepository(sorted)) {
        const repoKey = `${accountUUID}-${repoName}`;

        list.push({
          key: `repository-${repoKey}`,
          kind: 'repository',
          repoKey,
          repoName,
          notifications: repoNotifications,
        });

        if (collapsedRepositories.has(repoKey)) {
          continue;
        }

        for (const notification of repoNotifications) {
          list.push({
            key: `notification-${accountUUID}:${notification.id}`,
            kind: 'notification',
            notification,
            isAnimatingExit:
              animatingNotifications.has(`${accountUUID}:${notification.id}`) ||
              (animatingRepositories.get(repoKey)?.has(`${accountUUID}:${notification.id}`) ??
                false),
          });
        }
      }
    }

    return list;
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
