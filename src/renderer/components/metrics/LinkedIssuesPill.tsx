import type { MouseEvent } from 'react';

import { IssueRelatesToIcon } from '@primer/octicons-react';

import { type GitifyLinkedIssue, IconColor } from '../../types';

import { formatGitHubNumber, formatMetricDescription } from '../../utils/notifications/formatters';
import { openExternalLink } from '../../utils/system/comms';
import { MetricPill } from './MetricPill';

export interface LinkedIssuesPillProps {
  linkedIssues: GitifyLinkedIssue[];
}

export function LinkedIssuesPill({ linkedIssues }: Readonly<LinkedIssuesPillProps>) {
  if (!linkedIssues?.length) {
    return null;
  }

  const description = formatMetricDescription(
    linkedIssues.length,
    'issue',
    (_, noun) =>
      `Linked ${noun}: ${linkedIssues.map((issue) => formatGitHubNumber(issue.number)).join(', ')}`,
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
