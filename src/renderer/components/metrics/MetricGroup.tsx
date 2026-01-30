import type { FC } from 'react';

import { useAppContext } from '../../hooks/useAppContext';

import type { GitifyNotification } from '../../types';

import { CommentsPill } from './CommentsPill';
import { LabelsPill } from './LabelsPill';
import { LinkedIssuesPill } from './LinkedIssuesPill';
import { MilestonePill } from './MilestonePill';
import { ReactionsPill } from './ReactionsPill';
import { ReviewsPill } from './ReviewsPill';

export interface MetricGroupProps {
  notification: GitifyNotification;
}

export const MetricGroup: FC<MetricGroupProps> = ({ notification }) => {
  const { settings } = useAppContext();

  if (!settings.showPills) {
    return null;
  }

  return (
    <div className="flex gap-1">
      <LinkedIssuesPill
        linkedIssues={notification.subject.linkedIssues ?? []}
      />

      <ReactionsPill
        reactionGroups={notification.subject.reactionGroups ?? []}
        reactionsCount={notification.subject.reactionsCount ?? 0}
      />

      <ReviewsPill reviews={notification.subject.reviews ?? []} />

      <CommentsPill commentCount={notification.subject.commentCount ?? 0} />

      <MilestonePill milestone={notification.subject.milestone} />

      <LabelsPill labels={notification.subject.labels ?? []} />
    </div>
  );
};
