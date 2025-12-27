import { type FC, useId } from 'react';

import { IssueOpenedIcon } from '@primer/octicons-react';
import { Text } from '@primer/react';

import { stateFilter } from '../../utils/notifications/filters';
import { FilterSection } from './FilterSection';

export const StateFilter: FC = () => {
  const id = useId();

  return (
    <FilterSection
      filter={stateFilter}
      filterSetting="filterStates"
      icon={IssueOpenedIcon}
      id={id}
      title="State"
      tooltip={<Text>Filter notifications by state.</Text>}
    />
  );
};
