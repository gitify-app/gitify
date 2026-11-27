import type { GitifyIssueStatus } from '../../types';

import { getIssueStatusIcon } from '../../icons/IssueStatusIcon';
import { MetricPill } from './MetricPill';

export interface IssueStatusPillProps {
  status?: GitifyIssueStatus;
}

export function IssueStatusPill({ status }: Readonly<IssueStatusPillProps>) {
  if (!status) {
    return null;
  }

  return (
    <MetricPill
      ariaLabel={`Issue status: ${status.name}`}
      color={status.color}
      contents={status.name}
      icon={getIssueStatusIcon(status.kind)}
      metric={status.name}
    />
  );
}
