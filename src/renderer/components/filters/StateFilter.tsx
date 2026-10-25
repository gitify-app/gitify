import { useTranslation } from 'react-i18next';

import { IssueOpenedIcon } from '@primer/octicons-react';
import { Text } from '@primer/react';

import { stateFilter } from '../../utils/notifications/filters';
import { FilterSection } from './FilterSection';

export function StateFilter() {
  const { t } = useTranslation();

  return (
    <FilterSection
      filter={stateFilter}
      filterSetting="states"
      icon={IssueOpenedIcon}
      id="filter-state"
      title={t('filters.state.title', 'State')}
      tooltip={<Text>{t('filters.state.help', 'Filter notifications by state.')}</Text>}
    />
  );
}
