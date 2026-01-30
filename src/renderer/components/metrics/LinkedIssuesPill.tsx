import type { FC } from 'react';

import { IssueOpenedIcon } from '@primer/octicons-react';

import { IconColor } from '../../types';

import { formatMetricDescription } from '../../utils/notifications/formatters';
import { MetricPill } from './MetricPill';

export interface LinkedIssuesPillProps {
  linkedIssues: string[];
}

export const LinkedIssuesPill: FC<LinkedIssuesPillProps> = ({
  linkedIssues,
}) => {
  if (!linkedIssues?.length) {
    return null;
  }

  const description = formatMetricDescription(
    linkedIssues.length,
    'issue',
    (noun) => `Linked to ${noun}: ${linkedIssues.join(', ')}`,
  );

  return (
    <MetricPill
      color={IconColor.GRAY}
      contents={description}
      icon={IssueOpenedIcon}
      metric={linkedIssues.length}
    />
  );
};
