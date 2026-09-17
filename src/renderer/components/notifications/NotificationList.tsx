import { type FC, useCallback, useMemo, useState } from 'react';

import { useVirtualizer } from '@tanstack/react-virtual';

import { useAccountsStore, useSettingsStore } from '../../stores';

import { Contents } from '../layout/Contents';

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
      isRepositoryAnimatingExit: boolean;
    };

const ESTIMATED_HEIGHT = { notification: 58, header: 36 };

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

  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(null);
  const [collapsedAccounts, setCollapsedAccounts] = useState<ReadonlySet<string>>(new Set());
  const [collapsedRepositories, setCollapsedRepositories] = useState<ReadonlySet<string>>(
    new Set(),
  );
  const [animatingRepositories, setAnimatingRepositories] = useState<ReadonlySet<string>>(
    new Set(),
  );

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

  const setRepositoryAnimatingExit = useCallback((repoKey: string, animate: boolean) => {
    setAnimatingRepositories((current) => {
      const next = new Set(current);

      if (animate) {
        next.add(repoKey);
      } else {
        next.delete(repoKey);
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
            key: `notification-${notification.id}`,
            kind: 'notification',
            notification,
            isRepositoryAnimatingExit: false,
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
            key: `notification-${notification.id}`,
            kind: 'notification',
            notification,
            isRepositoryAnimatingExit: animatingRepositories.has(repoKey),
          });
        }
      }
    }

    return list;
  }, [
    accountNotifications,
    animatingRepositories,
    collapsedAccounts,
    collapsedRepositories,
    groupBy,
    hasMultipleAccounts,
    showAccountHeader,
  ]);

  // oxlint-disable-next-line react/incompatible-library -- Its values are only read in this component's own JSX, never passed to a memoized child
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollElement,
    estimateSize: (index) =>
      items[index].kind === 'notification'
        ? ESTIMATED_HEIGHT.notification
        : ESTIMATED_HEIGHT.header,
    getItemKey: (index) => items[index].key,
    overscan: 8,
  });

  return (
    <Contents paddingHorizontal={false} ref={setScrollElement}>
      <div className="relative w-full" style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const item = items[virtualItem.index];

          return (
            <div
              className="absolute inset-x-0 top-0"
              data-index={virtualItem.index}
              key={virtualItem.key}
              ref={virtualizer.measureElement}
              style={{ transform: `translateY(${virtualItem.start}px)` }}
            >
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
                  onAnimateExit={(animate) => setRepositoryAnimatingExit(item.repoKey, animate)}
                  onToggle={() => toggleCollapsedRepository(item.repoKey)}
                  repoName={item.repoName}
                  repoNotifications={item.notifications}
                />
              )}

              {item.kind === 'notification' && (
                <NotificationRow
                  isRepositoryAnimatingExit={item.isRepositoryAnimatingExit}
                  notification={item.notification}
                />
              )}
            </div>
          );
        })}
      </div>
    </Contents>
  );
};
