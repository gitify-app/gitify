import { startTransition, useCallback, addTransitionType } from 'react';
import { type NavigateOptions, type To, useNavigate } from 'react-router';

export type AppNavigate = (to: To | number, options?: NavigateOptions) => void;

/**
 * Navigates inside a React transition so the routed content can participate in
 * a view transition. This is the only supported way to navigate within the
 * renderer; use it instead of the raw router hook.
 */
export function useAppNavigate(): AppNavigate {
  const navigate = useNavigate();

  return useCallback(
    (to, options) => {
      startTransition(() => {
        addTransitionType('route');
        if (typeof to === 'number') {
          void navigate(to);
        } else if (options === undefined) {
          void navigate(to);
        } else {
          void navigate(to, options);
        }
      });
    },
    [navigate],
  );
}
