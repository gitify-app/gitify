import { QueryClient } from '@tanstack/react-query';

import { Constants } from '../../constants';

/**
 * TanStack Query client for all API state.
 *
 * Retries are handled here rather than at the HTTP client layer.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchIntervalInBackground: true,
      staleTime: Constants.QUERY_STALE_TIME_MS,
      networkMode: 'online',
    },
    mutations: {
      retry: 1,
    },
  },
});
