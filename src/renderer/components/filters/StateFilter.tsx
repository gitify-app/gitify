import type { FC } from 'react';

import { IssueOpenedIcon } from '@primer/octicons-react';

import { stateFilter } from '../../utils/notifications/filters';
import { Text } from '../ui';
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
