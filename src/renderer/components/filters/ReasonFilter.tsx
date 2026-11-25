import { useTranslation } from 'react-i18next';

import { NoteIcon } from '@primer/octicons-react';
import { Text } from '@primer/react';

import { reasonFilter } from '../../utils/notifications/filters';
import { FilterSection } from './FilterSection';

export function ReasonFilter() {
  const { t } = useTranslation();

  return (
    <FilterSection
      filter={reasonFilter}
      filterSetting="reasons"
      icon={NoteIcon}
      id="filter-reasons"
      title={t('filters.reason.title', 'Reason')}
      tooltip={<Text>{t('filters.reason.help', 'Filter notifications by reason.')}</Text>}
    />
  );
}
