import { useEffect, useState } from 'react';

const QUERY = '(prefers-contrast: more)';

/**
 * Tracks the OS "Increase Contrast" accessibility setting (live). Drives the
 * high-contrast Primer schemes for Classic and the solid fallback for Glass, so
 * raising contrast in the system settings takes effect without an app restart.
 */
export function usePrefersContrast(): boolean {
  const [more, setMore] = useState(() => window.matchMedia(QUERY).matches);

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const onChange = () => setMore(mql.matches);

    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return more;
}
