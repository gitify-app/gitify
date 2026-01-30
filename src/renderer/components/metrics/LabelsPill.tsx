import type { FC } from 'react';

import { TagIcon } from '@primer/octicons-react';

import { IconColor } from '../../types';

import { formatMetricDescription } from '../../utils/notifications/formatters';
import { MetricPill } from './MetricPill';

export interface LabelsPillProps {
  labels: string[];
}

export const LabelsPill: FC<LabelsPillProps> = ({ labels }) => {
  if (!labels?.length) {
    return null;
  }

  const description = formatMetricDescription(
    labels.length,
    'label',
    (count, noun) => {
      const formatted = labels.map((label) => `🏷️ ${label}`).join(', ');

      return `${count} ${noun}: ${formatted}`;
    },
  );

  return (
    <MetricPill
      color={IconColor.GRAY}
      icon={TagIcon}
      metric={labels.length}
      title={description}
    />
  );
};
