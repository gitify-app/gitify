import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { IssueRelatesToIcon } from '@primer/octicons-react';

import { IconColor } from '../../types';

import { formatMetricDescription } from '../../utils/notifications/formatters';
import { MetricPill } from './MetricPill';

export interface LinkedIssuesPillProps {
  linkedIssues: string[];
}

export const LinkedIssuesPill: FC<LinkedIssuesPillProps> = ({ linkedIssues }) => {
  const { t } = useTranslation();

  if (!linkedIssues?.length) {
    return null;
  }

  const description = formatMetricDescription(
    linkedIssues.length,
    t('metrics.issue', 'issue'),
    (_, noun) =>
      t('metrics.linked_to', 'Linked to {{noun}}: {{issues}}', {
        noun,
        issues: linkedIssues.join(', '),
      }),
  );

  return (
    <MetricPill
      color={IconColor.GRAY}
      contents={description}
      icon={IssueRelatesToIcon}
      metric={linkedIssues.length}
    />
  );
};
