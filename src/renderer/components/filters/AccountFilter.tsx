import { useTranslation } from 'react-i18next';

import { PersonIcon } from '@primer/octicons-react';
import { Stack, Text } from '@primer/react';

import { useNotifications } from '../../hooks/useNotifications';
import { useAccountsStore, useFiltersStore } from '../../stores';

import { SectionHeading } from '../primitives/SectionHeading';

import { getAccountUUID } from '../../utils/auth/utils';
import { FilterCheckbox } from './FilterCheckbox';

export function AccountFilter() {
  const { t } = useTranslation();
  const { notifications } = useNotifications();
  const accounts = useAccountsStore((s) => s.accounts);
  const filteredAccounts = useFiltersStore((s) => s.accounts);
  const updateFilter = useFiltersStore((s) => s.updateFilter);

  return (
    <fieldset id="filter-accounts">
      <SectionHeading
        as="legend"
        icon={PersonIcon}
        tooltip={<Text>{t('filters.account.help', 'Filter notifications by account.')}</Text>}
      >
        {t('filters.account.title', 'Account')}
      </SectionHeading>

      <Stack direction="vertical" gap="condensed">
        {accounts.map((account) => {
          const uuid = getAccountUUID(account);
          const isChecked = filteredAccounts.includes(uuid);
          const label = account.user?.login ?? account.hostname;
          const accountNotificationCount =
            notifications?.find((n) => getAccountUUID(n.account) === uuid)?.notifications.length ??
            0;

          return (
            <FilterCheckbox
              checked={isChecked}
              counter={accountNotificationCount}
              key={uuid}
              label={label}
              name={`account-${uuid}`}
              onChange={() => updateFilter('accounts', uuid, !isChecked)}
            />
          );
        })}
      </Stack>
    </fieldset>
  );
}
