import { useEffect, useRef } from 'react';

import { Constants } from '../constants';

import { useConnectionStore } from '../stores';

import type { AccountNotifications } from '../types';

import { hasCleanAccount, isRetryableConnectionError } from '../utils/notifications/recovery';

export interface ConnectionRecoveryInput {
  /** The device's online status from `useOnlineStatus`. */
  isOnline: boolean;
  /** A notification fetch is in flight. */
  isFetching: boolean;
  /** TanStack Query paused the notification fetch. */
  isPaused: boolean;
  /** The notification query failed outright. */
  isError: boolean;
  /** When the cached notification data last settled. */
  dataUpdatedAt: number;
  /** The current notification groups, including per-account errors. */
  notifications: AccountNotifications[];
}

/**
 * Drive the session-local connection lifecycle from online transitions, system
 * wake events, and notification fetch outcomes.
 *
 * Mount exactly once from the app-level effects host.
 *
 * Recovery starts when connectivity returns or the system wakes while online.
 * It holds until the first notification fetch settles after recovery began, a
 * definitive (non-retryable) failure is observed, or the bounded window
 * expires. Duplicate wake or online events do not extend the window.
 */
export function useConnectionRecovery({
  isOnline,
  isFetching,
  isPaused,
  isError,
  dataUpdatedAt,
  notifications,
}: ConnectionRecoveryInput): void {
  const state = useConnectionStore((s) => s.state);
  const recoveringSince = useConnectionStore((s) => s.recoveringSince);
  const baselineDataUpdatedAt = useConnectionStore((s) => s.baselineDataUpdatedAt);
  const setOffline = useConnectionStore((s) => s.setOffline);
  const startRecovery = useConnectionStore((s) => s.startRecovery);
  const settle = useConnectionStore((s) => s.settle);

  // Keep the latest data timestamp available to the wake listener without
  // re-subscribing on every notification update.
  const dataUpdatedAtRef = useRef(dataUpdatedAt);
  useEffect(() => {
    dataUpdatedAtRef.current = dataUpdatedAt;
  }, [dataUpdatedAt]);

  const previousOnlineRef = useRef(isOnline);

  useEffect(() => {
    const previousOnline = previousOnlineRef.current;
    previousOnlineRef.current = isOnline;

    if (!isOnline) {
      setOffline();
      return;
    }

    if (!previousOnline) {
      startRecovery(dataUpdatedAt);
    }
  }, [isOnline, dataUpdatedAt, setOffline, startRecovery]);

  useEffect(() => {
    return window.gitify.onSystemWake(() => {
      if (navigator.onLine) {
        startRecovery(dataUpdatedAtRef.current);
      } else {
        setOffline();
      }
    });
  }, [setOffline, startRecovery]);

  useEffect(() => {
    if (state !== 'recovering' || isPaused || isFetching) {
      return;
    }

    // An outright query error is not a connectivity outcome we can wait out.
    if (isError) {
      settle();
      return;
    }

    // No fetch has settled since recovery began.
    if (dataUpdatedAt <= baselineDataUpdatedAt) {
      return;
    }

    // A clean or partial success means the connection works. A settled failure
    // that is not retryable (auth, scope, rate limit, forbidden) is definitive.
    if (hasCleanAccount(notifications) || !isRetryableConnectionError(notifications)) {
      settle();
    }
  }, [
    state,
    isPaused,
    isFetching,
    isError,
    dataUpdatedAt,
    baselineDataUpdatedAt,
    notifications,
    settle,
  ]);

  useEffect(() => {
    if (state !== 'recovering' || recoveringSince === null) {
      return;
    }

    const remaining = Math.max(0, Constants.RECOVERY_WINDOW_MS - (Date.now() - recoveringSince));

    const timer = setTimeout(settle, remaining);
    return () => clearTimeout(timer);
  }, [state, recoveringSince, settle]);
}
