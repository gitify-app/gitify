import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import {
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
} from '../__mocks__/account-mocks';

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

  it('serves a newly mounted observer from cache instead of refreshing again', async () => {
    const { wrapper } = createWrapper();

    renderHook(() => useAccounts(), { wrapper });
    await waitFor(() => expect(refreshAccountSpy).toHaveBeenCalledTimes(1));

    // A second observer on the same key, well inside the refresh interval
    renderHook(() => useAccounts(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    expect(refreshAccountSpy).toHaveBeenCalledTimes(1);
  });

  it('refreshes again when the account list changes, despite the staleTime', async () => {
    const { wrapper } = createWrapper();

    renderHook(() => useAccounts(), { wrapper });
    await waitFor(() => expect(refreshAccountSpy).toHaveBeenCalledTimes(1));

    // A different account list is a different query key, so it has no cached
    // data to be considered fresh
    await act(async () => {
      useAccountsStore.setState({
        accounts: [mockGitHubCloudAccount, mockGitHubEnterpriseServerAccount],
      });
    });

    await waitFor(() => expect(refreshAccountSpy.mock.calls.length).toBeGreaterThan(1));
  });
});
