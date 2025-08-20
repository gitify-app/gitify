import { useCallback, useEffect, useRef } from 'react';

/**
 * Hook that triggers a callback after a specified period of user inactivity.
 * User activity (mouse movement, clicks, key presses) resets the timer.
 */
export const useInactivityTimer = (callback: () => void, delay: number) => {
  const savedCallback = useRef<(() => void) | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        savedCallback.current?.();
      }, delay);
    }
  }, [delay]);

  // Set up event listeners for user activity
  useEffect(() => {
    if (delay === null) {
      return;
    }

    // Events that indicate user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Add event listeners to track activity
    events.forEach((event) => {
      document.addEventListener(event, resetTimer, { passive: true });
    });

    // Start the initial timer
    resetTimer();

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [delay, resetTimer]);

  // Return the reset function for manual timer resets if needed
  return resetTimer;
};
