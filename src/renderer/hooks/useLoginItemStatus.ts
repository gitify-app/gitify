import { useEffect, useState } from 'react';

import type { ILoginItemSettings } from '../../shared/events';

/**
 * Read the operating system's login-item state and refresh it when the window
 * regains focus, so a change made in system settings is visible without
 * restarting the app.
 *
 * Returns `null` while the first read is in flight or when the read fails; the
 * settings screen then shows the stored preference without claiming the item
 * is active.
 */
export function useLoginItemStatus(): ILoginItemSettings | null {
  const [settings, setSettings] = useState<ILoginItemSettings | null>(null);

  useEffect(() => {
    let cancelled = false;

    const read = async () => {
      try {
        const next = await window.gitify.getLoginItemSettings();
        if (!cancelled) {
          setSettings(next);
        }
      } catch {
        if (!cancelled) {
          setSettings(null);
        }
      }
    };

    void read();

    const onFocus = () => {
      void read();
    };

    window.addEventListener('focus', onFocus);

    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  return settings;
}
