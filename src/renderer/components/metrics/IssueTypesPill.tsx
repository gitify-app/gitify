import { IssueOpenedIcon } from '@primer/octicons-react';

import type { GitifyIssueType } from '../../types';

import { MetricPill } from './MetricPill';

export interface IssueTypesPillProps {
  issueType?: GitifyIssueType;
}

export function IssueTypesPill({ issueType }: Readonly<IssueTypesPillProps>) {
  if (!issueType) {
    return null;
  }

  return (
    <MetricPill
      ariaLabel={`Issue type: ${issueType.name}`}
      color={issueType.color}
      contents={issueType.name}
      icon={IssueOpenedIcon}
    />
  );
}
