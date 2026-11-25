import type { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { IssueRelatesToIcon } from '@primer/octicons-react';

import { type GitifyLinkedIssue, IconColor } from '../../types';

import { formatGitHubNumber, formatMetricDescription } from '../../utils/notifications/formatters';
import { openExternalLink } from '../../utils/system/comms';
import { MetricPill } from './MetricPill';

export interface LinkedIssuesPillProps {
  linkedIssues: GitifyLinkedIssue[];
}

export function LinkedIssuesPill({ linkedIssues }: Readonly<LinkedIssuesPillProps>) {
  const { t } = useTranslation();
  if (!linkedIssues?.length) {
    return null;
  }

  const description = formatMetricDescription(
    linkedIssues.length,
    t('metrics.issue', 'issue'),
    (_, noun) =>
      t('metrics.linked_to', 'Linked {{noun}}: {{issues}}', {
        noun,
        issues: linkedIssues.map((issue) => formatGitHubNumber(issue.number)).join(', '),
      }),
  );

  const handleClick =
    linkedIssues.length === 1
      ? (event: MouseEvent<HTMLButtonElement>) => {
          event.stopPropagation();
          openExternalLink(linkedIssues[0].url);
        }
      : undefined;

  return (
    <MetricPill
      ariaLabel={description}
      color={IconColor.GRAY}
      contents={description}
      icon={IssueRelatesToIcon}
      metric={linkedIssues.length}
      onClick={handleClick}
    />
  );
}
