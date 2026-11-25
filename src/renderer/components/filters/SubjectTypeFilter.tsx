import { useTranslation } from 'react-i18next';

import { BellIcon } from '@primer/octicons-react';
import { Text } from '@primer/react';

import { subjectTypeFilter } from '../../utils/notifications/filters';
import { FilterSection } from './FilterSection';

export function SubjectTypeFilter() {
  const { t } = useTranslation();

  return (
    <FilterSection
      filter={subjectTypeFilter}
      filterSetting="subjectTypes"
      icon={BellIcon}
      id="filter-subject-type"
      title={t('filters.subject_type.title', 'Type')}
      tooltip={<Text>{t('filters.subject_type.help', 'Filter notifications by type.')}</Text>}
    />
  );
}
