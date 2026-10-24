import { useMemo } from 'react';

import type { QueryKey } from '@tanstack/react-query';

import { useAccountsStore, useSettingsStore } from '../../stores';

import { notificationsKeys } from '../../utils/api/queryKeys';
import { getAccountUUID } from '../../utils/auth/utils';

/**
 * The query key for the notifications list, derived from the stores that
 * parameterise it rather than from the query observer itself.
 *
 * Kept separate from `useNotificationsQuery` so that consumers which only need
 * notification actions - and so must not subscribe to notification data - can
 * still target the exact same cache entry as the readers.
 */
export const useNotificationsQueryKey = (): QueryKey => {
  const accounts = useAccountsStore((s) => s.accounts);
  const fetchReadNotifications = useSettingsStore((s) => s.fetchReadNotifications);
  const fetchParticipatingNotifications = useSettingsStore((s) => s.participating);

  return useMemo(
    () =>
      notificationsKeys.list(
        accounts.map(getAccountUUID),
        fetchReadNotifications,
        fetchParticipatingNotifications,
      ),
    [accounts, fetchReadNotifications, fetchParticipatingNotifications],
  );
};
