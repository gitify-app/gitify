import { useMemo } from 'react';

import { useFiltersStore } from '../../stores';

import type { Account, GroupBy } from '../../types';

import { getNotificationListDataKey } from '../../utils/notifications/listPositioning';

/**
 * Build the logical dataset identity used by the notification list's
 * positioning behavior. Filter values are read reactively so a filter change
 * resets the list, while notification content and counts do not affect it.
 */
export function useNotificationListDataKey({
  groupBy,
  accounts,
}: {
  groupBy: GroupBy;
  accounts: readonly Account[];
}): string {
  const includeSearchTokens = useFiltersStore((s) => s.includeSearchTokens);
  const excludeSearchTokens = useFiltersStore((s) => s.excludeSearchTokens);
  const filterAccounts = useFiltersStore((s) => s.accounts);
  const userTypes = useFiltersStore((s) => s.userTypes);
  const subjectTypes = useFiltersStore((s) => s.subjectTypes);
  const states = useFiltersStore((s) => s.states);
  const reasons = useFiltersStore((s) => s.reasons);
  const reviewRequestTypes = useFiltersStore((s) => s.reviewRequestTypes);

  return useMemo(
    () =>
      getNotificationListDataKey({
        groupBy,
        accounts,
        filters: {
          includeSearchTokens,
          excludeSearchTokens,
          accounts: filterAccounts,
          userTypes,
          subjectTypes,
          states,
          reasons,
          reviewRequestTypes,
        },
      }),
    [
      groupBy,
      accounts,
      includeSearchTokens,
      excludeSearchTokens,
      filterAccounts,
      userTypes,
      subjectTypes,
      states,
      reasons,
      reviewRequestTypes,
    ],
  );
}
