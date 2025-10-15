import { useEffect, useRef } from 'react';

/**
 * Hook that triggers a callback after a specified period of time.
 *
 * Thanks to https://overreacted.io/making-setinterval-declarative-with-react-hooks/
 */
export const useIntervalTimer = (callback: () => void, delay: number) => {
  const savedCallback = useRef<(() => void) | null>(null);

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};
