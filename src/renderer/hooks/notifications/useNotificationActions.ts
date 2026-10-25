import { useCallback } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import type { Account, AccountNotifications } from '../../types';

import { getAccountUUID } from '../../utils/auth/utils';
import { type NotificationMutations, useNotificationMutations } from './useNotificationMutations';
import { useNotificationsQueryKey } from './useNotificationsQueryKey';

export interface NotificationActions extends NotificationMutations {
  removeAccountNotifications: (account: Account) => void;
  refetchNotifications: () => Promise<void>;
}

/**
 * The action side of notification state, for consumers that perform actions but
 * do not read notification data.
 *
 * Unlike `useNotificationsQuery`, it never calls `useQuery`, so a consumer that
 * only needs these actions does not become an observer of the notifications
 * query. That matters most for `NotificationRow`, which mounts once per visible
 * item: as an observer it would re-run the query's `select` and structural-sharing
 * walk once per row on every cache write.
 *
 * The key is derived from the same stores the reader uses, so both target the
 * same cache entry.
 */
export const useNotificationActions = (): NotificationActions => {
  const queryClient = useQueryClient();
  const notificationsQueryKey = useNotificationsQueryKey();

  const mutations = useNotificationMutations(notificationsQueryKey);

  const removeAccountNotifications = useCallback(
    (account: Account) => {
      const accountUUID = getAccountUUID(account);

      queryClient.setQueryData<AccountNotifications[]>(
        notificationsQueryKey,
        (existing) =>
          existing?.filter(
            (accountNotifications) => getAccountUUID(accountNotifications.account) !== accountUUID,
          ) ?? [],
      );
    },
    [queryClient, notificationsQueryKey],
  );

  const refetchNotifications = useCallback(async () => {
    await queryClient.refetchQueries({ queryKey: notificationsQueryKey });
  }, [queryClient, notificationsQueryKey]);

  return {
    ...mutations,
    removeAccountNotifications,
    refetchNotifications,
  };
};
