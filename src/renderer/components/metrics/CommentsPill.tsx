import type { FC } from 'react';

import { CommentIcon } from '@primer/octicons-react';

import { type GitifyComment, IconColor } from '../../types';

import { formatMetricDescription } from '../../utils/notifications/formatters';
import { CommentsPreview } from '../previews/CommentsPreview';
import { MetricPill } from './MetricPill';

export interface CommentsPillProps {
  commentCount: number;
  comments?: GitifyComment[];
}

export const CommentsPill: FC<CommentsPillProps> = ({ commentCount, comments }) => {
  if (!commentCount) {
    return null;
  }

  const description = formatMetricDescription(commentCount, 'comment');

  return (
    <MetricPill
      color={IconColor.GRAY}
      contents={description}
      icon={CommentIcon}
      metric={commentCount}
      preview={comments?.length ? <CommentsPreview comments={comments} /> : undefined}
      previewTestId="comments-preview-card"
    />
  );
};
