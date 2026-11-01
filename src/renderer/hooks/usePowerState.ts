import { useEffect } from 'react';

import { usePowerStateStore } from '../stores';

/**
 * Subscribe the session power state to the main process's sleep and wake
 * events.
 *
 * Mount once from the app-level effects host. The store is session-local, so
 * it starts active and only changes while the app is running.
 */
export function usePowerState(): void {
  const setActive = usePowerStateStore((s) => s.setActive);

  useEffect(() => {
    const unsubscribeSleep = window.gitify.onSystemSleep(() => {
      setActive(false);
    });
    const unsubscribeWake = window.gitify.onSystemWake(() => {
      setActive(true);
    });

    return () => {
      unsubscribeSleep();
      unsubscribeWake();
    };
  }, [setActive]);
}
