import type { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { IssueTrackedByIcon } from '@primer/octicons-react';

import { type GitifyParentIssue, IconColor } from '../../types';

import { openExternalLink } from '../../utils/system/comms';
import { MetricPill } from './MetricPill';

export interface ParentPillProps {
  parent?: GitifyParentIssue | null;
}

export function ParentPill({ parent }: Readonly<ParentPillProps>) {
  const { t } = useTranslation();
  if (!parent) {
    return null;
  }

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    openExternalLink(parent.url);
  };

  const label = t('metrics.parent_issue', 'Parent issue: #{{number}} {{title}}', {
    number: parent.number,
    title: parent.title,
  });

  return (
    <MetricPill
      ariaLabel={label}
      color={IconColor.GRAY}
      contents={label}
      icon={IssueTrackedByIcon}
      metric={`#${parent.number}`}
      metricClassName="truncate max-w-[160px]"
      onClick={handleClick}
    />
  );
}
