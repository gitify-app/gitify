import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { mockGitHubCloudAccount } from '../__mocks__/account-mocks';

import { Constants } from '../constants';

import { useAccountsStore } from '../stores';

import * as authUtils from '../utils/auth/utils';
import { useAccounts } from './useAccounts';

describe('renderer/hooks/useAccounts.ts', () => {
  const refreshAccountSpy = vi
    .spyOn(authUtils, 'refreshAccount')
    .mockImplementation(async (account) => account);

  beforeEach(() => {
    refreshAccountSpy.mockClear();
    useAccountsStore.setState({ accounts: [mockGitHubCloudAccount] });
  });

  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          refetchOnWindowFocus: false,
          refetchInterval: false,
        },
      },
    });

    return {
      queryClient,
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    };
  };

  it('refreshes accounts on mount', async () => {
    const { wrapper } = createWrapper();

    renderHook(() => useAccounts(), { wrapper });

    await waitFor(() => expect(refreshAccountSpy).toHaveBeenCalledWith(mockGitHubCloudAccount));
  });

  it('exposes a manual refetch that re-runs the refresh', async () => {
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useAccounts(), { wrapper });
    await waitFor(() => expect(refreshAccountSpy).toHaveBeenCalledTimes(1));

    await act(async () => {
      await result.current.refetchAccounts();
    });

    await waitFor(() => expect(refreshAccountSpy).toHaveBeenCalledTimes(2));
  });

  it('sets an explicit staleTime aligned to the refresh interval', async () => {
    const { queryClient, wrapper } = createWrapper();

    renderHook(() => useAccounts(), { wrapper });
    await waitFor(() => expect(refreshAccountSpy).toHaveBeenCalledTimes(1));

    const [query] = queryClient.getQueryCache().getAll();
    const options = query.options as { staleTime?: number };
    expect(options.staleTime).toBe(Constants.REFRESH_ACCOUNTS_INTERVAL_MS);
  });
});
