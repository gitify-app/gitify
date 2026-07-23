import { useEffect, useState } from 'react';

import { onlineManager } from '@tanstack/react-query';

/**
 * Hook exposing the application's online / offline status, backed by
 * TanStack Query's onlineManager so it stays consistent with query
 * pause/resume behaviour.
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handle = () => {
      setIsOnline(onlineManager.isOnline());
    };

    // Subscribe and call immediately to set initial status
    const unsubscribe = onlineManager.subscribe(handle);
    handle();

    // Re-probe network state when the system wakes from sleep or the user
    // unlocks their screen. The browser's online/offline events may not have
    // fired yet by the time the renderer runs after a sleep cycle.
    const unsubscribeWake = window.gitify.onSystemWake(() =>
      onlineManager.setOnline(navigator.onLine),
    );

    return () => {
      unsubscribe();
      unsubscribeWake();
    };
  }, []);

  return isOnline;
}
