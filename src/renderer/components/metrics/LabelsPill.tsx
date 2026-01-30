import type { FC } from 'react';

import { TagIcon } from '@primer/octicons-react';
import { IssueLabelToken, LabelGroup } from '@primer/react';

import { type GitifyLabels, IconColor } from '../../types';

import { MetricPill } from './MetricPill';

export interface LabelsPillProps {
  labels: GitifyLabels[];
}

export const LabelsPill: FC<LabelsPillProps> = ({ labels }) => {
  if (!labels?.length) {
    return null;
  }

  const labelsContent = (
    <LabelGroup>
      {labels.map((label) => {
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
      metric={labels.length}
    />
  );
};
