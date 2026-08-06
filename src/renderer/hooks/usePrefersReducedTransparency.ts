import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-transparency: reduce)';

/**
 * Tracks the OS "Reduce Transparency" accessibility setting. This is the reliable
 * live signal (Electron's `nativeTheme` does not surface it); the main process
 * cannot read it, so Glass degradation is driven from the renderer.
 */
export function usePrefersReducedTransparency(): boolean {
  const [reduced, setReduced] = useState(() => window.matchMedia(QUERY).matches);

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const onChange = () => setReduced(mql.matches);

    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
