import type { FC } from 'react';

import { NoteIcon } from '@primer/octicons-react';

import { reasonFilter } from '../../utils/notifications/filters';
import { Text } from '../ui';
import { FilterSection } from './FilterSection';

export const ReasonFilter: FC = () => {
  return (
    <FilterSection
      filter={reasonFilter}
      filterSetting="reasons"
      icon={NoteIcon}
      id="filter-reasons"
      title="Reason"
      tooltip={<Text>Filter notifications by reason.</Text>}
    />
  );
};
