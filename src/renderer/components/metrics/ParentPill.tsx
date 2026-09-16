import type { FC, MouseEvent } from 'react';

import { IssueTrackedByIcon } from '@primer/octicons-react';

import { type GitifyParentIssue, IconColor } from '../../types';

import { openExternalLink } from '../../utils/system/comms';
import { MetricPill } from './MetricPill';

export interface ParentPillProps {
  parent?: GitifyParentIssue | null;
}

export const ParentPill: FC<ParentPillProps> = ({ parent }) => {
  if (!parent) {
    return null;
  }

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    openExternalLink(parent.url);
  };

  return (
    <MetricPill
      color={IconColor.GRAY}
      contents={`Parent issue: #${parent.number} ${parent.title}`}
      icon={IssueTrackedByIcon}
      metric={`#${parent.number} ${parent.title}`}
      metricClassName="truncate max-w-[160px]"
      onClick={handleClick}
    />
  );
};
