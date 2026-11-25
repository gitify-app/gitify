import { useEffect, useSyncExternalStore } from 'react';

import { onlineManager } from '@tanstack/react-query';

// Record transitions once, even when no React observer is mounted yet.
let networkStatus = {
  isOnline: onlineManager.isOnline(),
  reconnectedAt: undefined as number | undefined,
};

onlineManager.subscribe((isOnline) => {
  networkStatus = {
    isOnline,
    reconnectedAt: isOnline ? Date.now() : networkStatus.reconnectedAt,
  };
});

const subscribe = (onChange: () => void) => onlineManager.subscribe(onChange);
export const getNetworkStatus = () => networkStatus;

export function useNetworkStatus() {
  return useSyncExternalStore(subscribe, getNetworkStatus);
}

/**
 * Hook exposing the application's online / offline status, backed by
 * TanStack Query's onlineManager so it stays consistent with query
 * pause/resume behaviour.
 */
export function useOnlineStatus(): boolean {
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    // Re-probe network state when the system wakes from sleep or the user
    // unlocks their screen. The browser's online/offline events may not have
    // fired yet by the time the renderer runs after a sleep cycle.
    return window.gitify.onSystemWake(() => onlineManager.setOnline(navigator.onLine));
  }, []);

  return isOnline;
}
