import { useEffect, useRef } from 'react';

// Thanks to https://overreacted.io/making-setinterval-declarative-with-react-hooks/
export const useInterval = (callback, delay: number) => {
  const savedCallback = useRef(null);

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
