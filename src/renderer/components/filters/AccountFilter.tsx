import type { FC } from 'react';

import { PersonIcon } from '@primer/octicons-react';
import { Stack, Text } from '@primer/react';

import { useNotifications } from '../../hooks/useNotifications';
import { useAccountsStore, useFiltersStore } from '../../stores';

import { Checkbox } from '../fields/Checkbox';
import { Title } from '../primitives/Title';

import { getAccountUUID } from '../../utils/auth/utils';

export const AccountFilter: FC = () => {
  const { notifications } = useNotifications();
  const accounts = useAccountsStore((s) => s.accounts);
  const filteredAccounts = useFiltersStore((s) => s.accounts);
  const updateFilter = useFiltersStore((s) => s.updateFilter);

  return (
    <fieldset id="filter-accounts">
      <Title icon={PersonIcon} tooltip={<Text>Filter notifications by account.</Text>}>
        Account
      </Title>

      <Stack direction="vertical" gap="condensed">
        {accounts.map((account) => {
          const uuid = getAccountUUID(account);
          const isChecked = filteredAccounts.includes(uuid);
          const label = account.user?.login ?? account.hostname;
          const accountNotificationCount =
            notifications?.find((n) => getAccountUUID(n.account) === uuid)?.notifications.length ??
            0;

          return (
            <Checkbox
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
};
