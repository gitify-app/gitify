import { useTranslation } from 'react-i18next';

import { IssueOpenedIcon } from '@primer/octicons-react';
import { Text } from '@primer/react';

import { issueStatusFilter } from '../../utils/notifications/filters';
import { FilterSection } from './FilterSection';

export function IssueStatusFilter() {
  const { t } = useTranslation();

  return (
    <FilterSection
      filter={issueStatusFilter}
      filterSetting="issueStatuses"
      icon={IssueOpenedIcon}
      id="filter-issue-status"
      title={t('filters.issue_status.title', 'Issue status')}
      tooltip={
        <Text>
          {t(
            'filters.issue_status.help',
            'Show only issues in the selected statuses, such as In review or Done.',
          )}
        </Text>
      }
    />
  );
}
