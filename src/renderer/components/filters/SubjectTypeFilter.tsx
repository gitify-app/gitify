import type { FC } from 'react';

import { BellIcon } from '@primer/octicons-react';
import { Text } from '@primer/react';

import { subjectTypeFilter } from '../../utils/notifications/filters';
import { FilterSection } from './FilterSection';

export const SubjectTypeFilter: FC = () => {
  return (
    <FilterSection
      id="filter-subject-type"
      title="Type"
      icon={BellIcon}
      filter={subjectTypeFilter}
      filterSetting="filterSubjectTypes"
      tooltip={<Text>Filter notifications by type.</Text>}
    />
  );
};
