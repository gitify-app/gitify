import type { FC } from 'react';

import { CommentIcon } from '@primer/octicons-react';

import { IconColor } from '../../types';

import { formatMetricDescription } from '../../utils/notifications/formatters';
import { MetricPill } from './MetricPill';

export interface CommentsPillProps {
  commentCount: number;
}

export const CommentsPill: FC<CommentsPillProps> = ({ commentCount }) => {
  if (!commentCount) {
    return null;
  }

  const description = formatMetricDescription(commentCount, 'comment');

  return (
    <MetricPill
      color={IconColor.GRAY}
      icon={CommentIcon}
      metric={commentCount}
      title={description}
    />
  );
};
