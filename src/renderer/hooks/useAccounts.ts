import { useCallback } from 'react';

import { useQuery } from '@tanstack/react-query';

import { Constants } from '../constants';

import { useAccountsStore } from '../stores';

import type { Account } from '../types';

interface AccountsState {
  refetchAccounts: () => Promise<void>;
}

export const useAccounts = (accounts: Account[]): AccountsState => {
  const { refetch } = useQuery<boolean, Error>({
    queryKey: ['accounts', accounts.length],

    queryFn: async () => {
      const refreshAccount = useAccountsStore.getState().refreshAccount;
      await Promise.all(accounts.map(refreshAccount));

      return true;
    },

    enabled: accounts.length > 0,

    refetchInterval: Constants.REFRESH_ACCOUNTS_INTERVAL_MS,
    refetchOnWindowFocus: false,
  });

  const refetchAccounts = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    refetchAccounts,
  };
};
