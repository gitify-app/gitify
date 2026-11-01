import { useCallback } from 'react';
import { type NavigateOptions, type To, useNavigate } from 'react-router';

export type AppNavigate = (to: To | number, options?: NavigateOptions) => void;

/**
 * The renderer's shared navigation entry point. Keeping navigation behind one
 * hook gives tests and future navigation work a single call site, while routes
 * swap immediately with no page-level animation.
 */
export function useAppNavigate(): AppNavigate {
  const navigate = useNavigate();

  return useCallback(
    (to, options) => {
      if (typeof to === 'number') {
        void navigate(to);
      } else if (options === undefined) {
        void navigate(to);
      } else {
        void navigate(to, options);
      }
    },
    [navigate],
  );
}
