import { useCallback, useMemo, useState } from 'react';

import { LegendList } from '@legendapp/list/react';

import { useAccountsStore, useSettingsStore } from '../../stores';

import { type AccountNotifications, type GitifyNotification } from '../../types';

import { getAccountUUID } from '../../utils/auth/utils';
import {
  buildAccountItems,
  type BuildItemsContext,
  getItemKey,
  getItemType,
} from '../../utils/notifications/listItems';
import { AllRead } from '../AllRead';
import { Oops } from '../Oops';
import { AccountHeader } from './AccountHeader';
import { NotificationRow } from './NotificationRow';
import { RepositoryHeader } from './RepositoryHeader';

export interface NotificationListProps {
  accountNotifications: AccountNotifications[];
  showAccountHeader: boolean;
}

/**
 * Flattened so one virtualizer windows across group boundaries, and so collapse
 * and exit-animation state survives rows unmounting on scroll.
 */
export function NotificationList({
  accountNotifications,
  showAccountHeader,
}: Readonly<NotificationListProps>) {
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
}
