import type { FC } from 'react';

import { NoteIcon } from '@primer/octicons-react';
import { Text } from '@primer/react';

import { reasonFilter } from '../../utils/notifications/filters';
import { FilterSection } from './FilterSection';

export const ReasonFilter: FC = () => {
  return (
    <FilterSection
      id="filter-reasons"
      title="Reason"
      icon={NoteIcon}
      filter={reasonFilter}
      filterSetting="filterReasons"
      tooltip={<Text>Filter notifications by reason.</Text>}
    />
  );
};
