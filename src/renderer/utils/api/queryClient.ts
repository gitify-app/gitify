import { onlineManager, QueryClient } from '@tanstack/react-query';

import { Constants } from '../../constants';

/**
 * Set TanStack Query's online state from the browser's actual network state.
 *
 * `onlineManager` initializes to `online: true` regardless of reality, and
 * self-corrects only once the browser fires a native online/offline event.
 * Browsers emit those on transitions only, so a device already offline when
 * Gitify launches never gets one.
 */
export function syncOnlineManagerWithBrowser(): void {
  onlineManager.setOnline(navigator.onLine);
}

// Runs at import, before the client below exists and therefore before any
// query can fire, so a cold start while offline pauses rather than fetches.
syncOnlineManagerWithBrowser();

/**
 * TanStack Query client for all API state.
 *
 * Retries are handled here rather than at the HTTP client layer. Failed
 * queries retry once after a cooldown instead of the default near-instant
 * backoff, so a struggling GitHub/GHES instance is not hammered with
 * back-to-back polls while it recovers.
 *
 * `staleTime` is intentionally not set here:
 * each query has its own refetch cadence (notifications poll on a
 * user-configurable interval, accounts poll hourly), so both are configured
 * explicitly at each `useQuery` call site instead of a single value that
 * would be wrong for at least one of them.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: Constants.QUERY_RETRY_DELAY_MS,
      refetchIntervalInBackground: true,
      gcTime: Constants.QUERY_GC_TIME_MS,
      networkMode: 'online',
    },
    mutations: {
      retry: 1,
    },
  },
});
