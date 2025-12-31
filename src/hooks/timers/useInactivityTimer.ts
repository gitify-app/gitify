import { useCallback, useEffect, useRef } from 'react';

const events = ['mousedown', 'keypress', 'click'];

/**
 * Hook that triggers a callback after a specified period of user inactivity.
 * User activity as defined in `events` will reset the timer.
 */
export const useInactivityTimer = (
  callback: () => void,
  delay: number | null,
) => {
  const savedCallback = useRef<(() => void) | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Reset the inactivity timer
  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (delay !== null && savedCallback.current) {
      timeoutRef.current = setTimeout(() => {
        // Fire callback once inactivity threshold reached
        savedCallback.current?.();

        // Schedule next run while still inactive
        resetTimer();
      }, delay);
    }
  }, [delay]);

  // Set up event listeners for user activity
  useEffect(() => {
    if (delay === null) {
      return;
    }

    // Add event listeners to track activity
    for (const event of events) {
      document.addEventListener(event, resetTimer, { passive: true });
    }

    // Start initial timer
    resetTimer();

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      for (const event of events) {
        document.removeEventListener(event, resetTimer);
      }
    };
  }, [delay, resetTimer]);
};
