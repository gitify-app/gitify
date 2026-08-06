import type { FC } from 'react';

import { IssueOpenedIcon } from '@primer/octicons-react';

import type { GitifyIssueType } from '../../types';

import { MetricPill } from './MetricPill';

export interface IssueTypesPillProps {
  issueType?: GitifyIssueType;
}

export const IssueTypesPill: FC<IssueTypesPillProps> = ({ issueType }) => {
  if (!issueType) {
    return null;
  }

  return (
    <MetricPill
      color={issueType.color}
      contents={issueType.name}
      icon={IssueOpenedIcon}
      metric={undefined}
    />
  );
};
