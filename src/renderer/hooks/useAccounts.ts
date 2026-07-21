import { useCallback, useEffect, useRef } from 'react';

import { useQuery } from '@tanstack/react-query';

import { Constants } from '../constants';

import { useAccountsStore } from '../stores';

import { accountsKeys } from '../utils/api/queryKeys';
import { getAccountUUID } from '../utils/auth/utils';

interface AccountsState {
  refetchAccounts: () => Promise<void>;
}

/**
 * Hook that keeps account details fresh.
 *
 * Refreshes all accounts on startup and on an hourly interval via TanStack
 * Query. Any keychain-rotated token ciphertext is persisted once, before the
 * first refresh, so rotated tokens are stored ahead of any API calls.
 */
export const useAccounts = (): AccountsState => {
  const accounts = useAccountsStore((state) => state.accounts);

  const hasPersistedRotatedTokensRef = useRef(false);

  const { refetch } = useQuery<boolean, Error>({
    queryKey: accountsKeys.refresh(accounts.map(getAccountUUID)),

    queryFn: async () => {
      if (!hasPersistedRotatedTokensRef.current) {
        await useAccountsStore.getState().persistRotatedAccountTokens();
        hasPersistedRotatedTokensRef.current = true;
      }

      const refreshAccount = useAccountsStore.getState().refreshAccount;
      await Promise.all(useAccountsStore.getState().accounts.map(refreshAccount));

      return true;
    },

    enabled: accounts.length > 0,

    refetchInterval: Constants.REFRESH_ACCOUNTS_INTERVAL_MS,
    refetchOnWindowFocus: false,
  });

  const refetchAccounts = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Refetch accounts immediately when the system wakes from sleep or the user
  // unlocks their screen, without waiting for the next scheduled interval.
  useEffect(() => {
    window.gitify.onSystemWake(() => {
      refetch();
    });
  }, [refetch]);

  return {
    refetchAccounts,
  };
};
