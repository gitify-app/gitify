import { type FC, useId } from 'react';

import { BellIcon } from '@primer/octicons-react';
import { Text } from '@primer/react';

import { subjectTypeFilter } from '../../utils/notifications/filters';
import { FilterSection } from './FilterSection';

export const SubjectTypeFilter: FC = () => {
  const id = useId();

  return (
    <FilterSection
      filter={subjectTypeFilter}
      filterSetting="filterSubjectTypes"
      icon={BellIcon}
      id={id}
      title="Type"
      tooltip={<Text>Filter notifications by type.</Text>}
    />
  );
};
