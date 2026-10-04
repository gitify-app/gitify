import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { CommentIcon } from '@primer/octicons-react';

import { IconColor } from '../../types';

import { formatMetricDescription } from '../../utils/notifications/formatters';
import { MetricPill } from './MetricPill';

export interface CommentsPillProps {
  commentCount: number;
}

export const CommentsPill: FC<CommentsPillProps> = ({ commentCount }) => {
  const { t } = useTranslation();

  if (!commentCount) {
    return null;
  }

  const description = formatMetricDescription(commentCount, t('metrics.comment', 'comment'));

  return (
    <MetricPill
      color={IconColor.GRAY}
      contents={description}
      icon={CommentIcon}
      metric={commentCount}
    />
  );
};
