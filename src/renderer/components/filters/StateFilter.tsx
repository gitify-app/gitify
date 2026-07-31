import type { FC } from 'react';

import { IssueOpenedIcon } from '@primer/octicons-react';
import { Text } from '@primer/react';

import { stateFilter } from '../../utils/notifications/filters';
import { FilterSection } from './FilterSection';

export const StateFilter: FC = () => {
  return (
    <FilterSection
      filter={stateFilter}
      filterSetting="states"
      icon={IssueOpenedIcon}
      id="filter-state"
      title="State"
      tooltip={<Text>Filter notifications by state.</Text>}
    />
  );
};
