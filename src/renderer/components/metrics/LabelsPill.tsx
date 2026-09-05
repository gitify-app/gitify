import type { FC } from 'react';

import { TagIcon } from '@primer/octicons-react';
import { IssueLabelToken, LabelGroup } from '@primer/react';

import { type GitifyIssueField, type GitifyLabels, IconColor } from '../../types';

import { MetricPill } from './MetricPill';

export interface LabelsPillProps {
  labels: GitifyLabels[];
  issueFields?: GitifyIssueField[];
}

export const LabelsPill: FC<LabelsPillProps> = ({ labels, issueFields }) => {
  const fieldLabels: GitifyLabels[] = (issueFields ?? []).map((field) => {
    return {
      name: `${field.name}: ${field.value}`,
      color: field.color ?? '',
    };
  });

  const allLabels = [...fieldLabels, ...(labels ?? [])];

  if (!allLabels.length) {
    return null;
  }

  const labelsContent = (
    <LabelGroup>
      {allLabels.map((label) => {
        return (
          <IssueLabelToken
            fillColor={label.color ? `#${label.color}` : undefined}
            key={label.name}
            size="small"
            text={label.name}
          />
        );
      })}
    </LabelGroup>
  );

  return (
    <MetricPill
      color={IconColor.GRAY}
      contents={labelsContent}
      icon={TagIcon}
      metric={allLabels.length}
    />
  );
};
