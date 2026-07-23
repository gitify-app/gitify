import { QueryClient } from '@tanstack/react-query';

import { Constants } from '../../constants';

/**
 * TanStack Query client for all API state.
 *
 * Retries are handled here rather than at the HTTP client layer. Failed
 * queries retry once after a cooldown instead of the default near-instant
 * backoff, so a struggling GitHub/GHES instance is not hammered with
 * back-to-back polls while it recovers.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: Constants.QUERY_RETRY_DELAY_MS,
      refetchIntervalInBackground: true,
      staleTime: Constants.QUERY_STALE_TIME_MS,
      networkMode: 'online',
    },
    mutations: {
      retry: 1,
    },
  },
});
