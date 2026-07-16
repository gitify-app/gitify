import { useCallback, useRef } from 'react';

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
 * Query. Token migration runs once, before the first refresh, so legacy or
 * rotated tokens are re-encrypted ahead of any API calls.
 */
export const useAccounts = (): AccountsState => {
  const accounts = useAccountsStore((state) => state.accounts);

  const hasMigratedTokensRef = useRef(false);

  const { refetch } = useQuery<boolean, Error>({
    queryKey: accountsKeys.refresh(accounts.map(getAccountUUID)),

    queryFn: async () => {
      // TODO - Remove token migration logic in future release
      if (!hasMigratedTokensRef.current) {
        await useAccountsStore.getState().migrateAccountTokens();
        hasMigratedTokensRef.current = true;
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

  return {
    refetchAccounts,
  };
};
