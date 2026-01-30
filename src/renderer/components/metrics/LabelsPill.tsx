import type { FC } from 'react';

import { IssueLabelToken, LabelGroup } from '@primer/react';

import type { GitifyLabels } from '../../types';

export interface LabelsPillProps {
  labels: GitifyLabels[];
}

export const LabelsPill: FC<LabelsPillProps> = ({ labels }) => {
  if (!labels?.length) {
    return null;
  }

  const labelsContent = (
    <LabelGroup visibleChildCount="auto">
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

  return labelsContent;
};
