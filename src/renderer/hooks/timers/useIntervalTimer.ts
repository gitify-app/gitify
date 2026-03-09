import { useEffect, useRef } from 'react';

/**
 * Hook that triggers a callback on a recurring interval.
 *
 * Thanks to https://overreacted.io/making-setinterval-declarative-with-react-hooks/
 *
 * @param callback - Function to call on each interval tick. Always uses the latest reference.
 * @param delay - Interval duration in milliseconds. Pass `null` to disable.
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
