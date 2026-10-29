import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { LegendList, type LegendListRef } from '@legendapp/list/react';

import { useNotificationListDataKey } from '../../hooks/notifications/useNotificationListDataKey';
import { useAccountsStore, useNotificationFocusStore, useSettingsStore } from '../../stores';

import { type AccountNotifications, type GitifyNotification } from '../../types';

import { getAccountUUID } from '../../utils/auth/utils';
import {
  buildAccountItems,
  type BuildItemsContext,
  getItemKey,
  getItemType,
  getNotificationItemKey,
} from '../../utils/notifications/listItems';
import {
  FOCUS_HIGHLIGHT_MS,
  FOCUS_VIEW_OFFSET,
  getStickyHeaderIndices,
  resolveNotificationFocus,
} from '../../utils/notifications/listPositioning';
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
  const accounts = useAccountsStore((s) => s.accounts);
  const hasMultipleAccounts = useAccountsStore((s) => s.hasMultipleAccounts());
  const dataKey = useNotificationListDataKey({ groupBy, accounts });

  const focusIntent = useNotificationFocusStore((s) => s.intent);
  const clearFocus = useNotificationFocusStore((s) => s.clearFocus);

  const listRef = useRef<LegendListRef>(null);
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [focusedKey, setFocusedKey] = useState<string | null>(null);

  // Adjust state during render so the list receives the new dataset identity
  // and the readiness gate in the same commit, before its first placement.
  const [previousDataKey, setPreviousDataKey] = useState(dataKey);
  const [pendingDatasetReset, setPendingDatasetReset] = useState(false);

  if (previousDataKey !== dataKey) {
    setPreviousDataKey(dataKey);
    setPendingDatasetReset(true);
    setIsReady(false);
  }

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

  const stickyHeaderIndices = useMemo(() => getStickyHeaderIndices(items), [items]);
  const stickyHeaderConfig = useMemo(() => ({ offset: 0 }), []);
  const maintainVisibleContentPosition = useMemo(
    () => ({
      data: true,
      shouldRestorePosition: () => !pendingDatasetReset,
    }),
    [pendingDatasetReset],
  );

  const clearHighlight = useCallback(() => {
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
      highlightTimeoutRef.current = null;
    }

    setFocusedKey(null);
  }, []);

  const handleReady = useCallback(() => {
    if (pendingDatasetReset) {
      setPendingDatasetReset(false);
      void listRef.current?.scrollToOffset({ offset: 0, animated: false });
    }

    setIsReady(true);
  }, [pendingDatasetReset]);

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!focusIntent || !isReady) {
      return;
    }

    const resolution = resolveNotificationFocus({
      accountNotifications,
      items,
      accountUUID: focusIntent.accountUUID,
      notificationId: focusIntent.notificationId,
      collapsedAccounts,
      collapsedRepositories,
    });

    if (resolution.status === 'filtered-out' || resolution.status === 'missing') {
      clearFocus(focusIntent.requestId);
      return;
    }

    if (resolution.status === 'collapsed-account') {
      // oxlint-disable-next-line react/set-state-in-effect -- A focus request is an external event; expanding its group is the response.
      toggleCollapsedAccount(focusIntent.accountUUID);
      return;
    }

    if (resolution.status === 'collapsed-repository') {
      // oxlint-disable-next-line react/set-state-in-effect -- A focus request is an external event; expanding its group is the response.
      toggleCollapsedRepository(resolution.repoKey);
      return;
    }

    const key = getNotificationItemKey(focusIntent.accountUUID, focusIntent.notificationId);

    void listRef.current
      ?.scrollToIndex({
        index: resolution.index,
        viewPosition: 0,
        viewOffset: FOCUS_VIEW_OFFSET,
        viewPositionFallback: 'start',
        animated: true,
      })
      .catch(() => {
        // The list may unmount while the scroll is in flight; the intent is
        // still consumed so a later data update does not replay it.
      });

    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }

    setFocusedKey(key);
    highlightTimeoutRef.current = setTimeout(() => setFocusedKey(null), FOCUS_HIGHLIGHT_MS);
    clearFocus(focusIntent.requestId);
  }, [
    accountNotifications,
    clearFocus,
    collapsedAccounts,
    collapsedRepositories,
    focusIntent,
    isReady,
    items,
    toggleCollapsedAccount,
    toggleCollapsedRepository,
  ]);

  return (
    <div
      className="grow min-h-0 overflow-hidden"
      onKeyDownCapture={clearHighlight}
      onPointerDownCapture={clearHighlight}
    >
      <LegendList
        className="overflow-y-auto"
        data={items}
        dataKey={dataKey}
        estimatedItemSize={58}
        getItemType={getItemType}
        keyExtractor={getItemKey}
        maintainVisibleContentPosition={maintainVisibleContentPosition}
        onReady={handleReady}
        ref={listRef}
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
                isFocused={item.key === focusedKey}
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
        stickyHeaderConfig={stickyHeaderConfig}
        stickyHeaderIndices={stickyHeaderIndices}
        style={{ height: '100%', overflowX: 'hidden' }}
      />
    </div>
  );
}
