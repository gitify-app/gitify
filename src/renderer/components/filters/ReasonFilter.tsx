import { NoteIcon } from '@primer/octicons-react';
import { Text } from '@primer/react';

import { reasonFilter } from '../../utils/notifications/filters';
import { FilterSection } from './FilterSection';

export function ReasonFilter() {
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
}
