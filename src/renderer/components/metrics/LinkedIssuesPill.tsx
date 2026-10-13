import type { FC } from 'react';

import { IssueRelatesToIcon } from '@primer/octicons-react';

import { type GitifyLinkedIssue, IconColor } from '../../types';

import { formatGitHubNumber, formatMetricDescription } from '../../utils/notifications/formatters';
import { LinkedIssuesCard } from '../previews/LinkedIssuesCard';
import { MetricPill } from './MetricPill';

export interface LinkedIssuesPillProps {
  linkedIssues: GitifyLinkedIssue[];
}

export const LinkedIssuesPill: FC<LinkedIssuesPillProps> = ({ linkedIssues }) => {
  if (!linkedIssues?.length) {
    return null;
  }

  const numbers = linkedIssues.map((issue) => formatGitHubNumber(issue.number));
  const description = formatMetricDescription(
    linkedIssues.length,
    'issue',
    (_, noun) => `Linked to ${noun}: ${numbers.join(', ')}`,
  );

  return (
    <MetricPill
      color={IconColor.GRAY}
      contents={description}
      icon={IssueRelatesToIcon}
      metric={linkedIssues.length}
      preview={<LinkedIssuesCard linkedIssues={linkedIssues} />}
      previewTestId="linked-issues-preview"
    />
  );
};
