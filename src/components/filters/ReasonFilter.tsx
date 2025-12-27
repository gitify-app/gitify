import { type FC, useId } from 'react';

import { NoteIcon } from '@primer/octicons-react';
import { Text } from '@primer/react';

import { reasonFilter } from '../../utils/notifications/filters';
import { FilterSection } from './FilterSection';

export const ReasonFilter: FC = () => {
  const id = useId();

  return (
    <FilterSection
      filter={reasonFilter}
      filterSetting="filterReasons"
      icon={NoteIcon}
      id={id}
      title="Reason"
      tooltip={<Text>Filter notifications by reason.</Text>}
    />
  );
};
