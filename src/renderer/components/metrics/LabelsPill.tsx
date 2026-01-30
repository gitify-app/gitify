import type { FC } from 'react';

import { TagIcon } from '@primer/octicons-react';
import { IssueLabelToken } from '@primer/react';

import { type GitifyLabels, IconColor } from '../../types';

import { formatMetricDescription } from '../../utils/notifications/formatters';
import { MetricPill } from './MetricPill';

export interface LabelsPillProps {
  labels: GitifyLabels[];
}

export const LabelsPill: FC<LabelsPillProps> = ({ labels }) => {
  if (!labels?.length) {
    return null;
  }

  const description = formatMetricDescription(
    labels.length,
    'label',
    (count, noun) => `${count} ${noun}`,
  );

  const tooltipContent = (
    <div>
      <span className="sr-only">{description}</span>
      <div className="flex flex-wrap gap-1">
        {labels.map((label) => {
          const safeColor = label.color
            ? `#${String(label.color).replace(/^#/, '')}`
            : undefined;
          return (
            <span
              key={label.name}
              style={{
                display: 'inline-block',
                transform: 'scale(0.8)',
                transformOrigin: 'left center',
              }}
            >
              <IssueLabelToken
                fillColor={safeColor}
                size="small"
                text={label.name}
              />
            </span>
          );
        })}
      </div>
    </div>
  );

  return (
    <MetricPill
      color={IconColor.GRAY}
      content={tooltipContent}
      icon={TagIcon}
      metric={labels.length}
      title={'labels'}
    />
  );
};
