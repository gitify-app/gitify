import type { FC } from 'react';

import { IssueOpenedIcon } from '@primer/octicons-react';
import { Text } from '@primer/react';

import { stateFilter } from '../../utils/notifications/filters';
import { FilterSection } from './FilterSection';

export const StateFilter: FC = () => {
  return (
    <FilterSection
      id="filter-state"
      title="State"
      icon={IssueOpenedIcon}
      filter={stateFilter}
      filterSetting="filterStates"
      tooltip={<Text>Filter notifications by state.</Text>}
    />
  );
};
