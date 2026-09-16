import type { FC } from 'react';

import { useSettingsStore } from '../../stores';

import type { GitifyNotification } from '../../types';

import { CommentsPill } from './CommentsPill';
import { IssueTypesPill } from './IssueTypesPill';
import { LabelsPill } from './LabelsPill';
import { LinkedIssuesPill } from './LinkedIssuesPill';
import { MilestonePill } from './MilestonePill';
import { ParentPill } from './ParentPill';
import { ReactionsPill } from './ReactionsPill';
import { ReviewsPill } from './ReviewsPill';
import { StackedPrsPill } from './StackedPrsPill';
import { SubIssueProgressPill } from './SubIssueProgressPill';

export interface MetricGroupProps {
  notification: GitifyNotification;
}

export const MetricGroup: FC<MetricGroupProps> = ({ notification }) => {
  const showPills = useSettingsStore((s) => s.showPills);

  if (!showPills) {
    return null;
  }

  return (
    <div className="flex gap-1">
      <IssueTypesPill issueType={notification.subject.issueType} />

      <LinkedIssuesPill linkedIssues={notification.subject.linkedIssues ?? []} />

      <StackedPrsPill
        isStacked={notification.subject.isStacked}
        stackPosition={notification.subject.stackPosition}
        stackDepth={notification.subject.stackDepth}
      />

      <ReactionsPill
        reactionGroups={notification.subject.reactionGroups ?? []}
        reactionsCount={notification.subject.reactionsCount ?? 0}
      />

      <ReviewsPill reviewers={notification.subject.reviewers ?? []} />

      <CommentsPill commentCount={notification.subject.commentCount ?? 0} />

      <MilestonePill milestone={notification.subject.milestone!} />

      <ParentPill parent={notification.subject.parentIssue} />

      <SubIssueProgressPill progress={notification.subject.subIssueProgress} />

      <LabelsPill labels={notification.subject.labels ?? []} />
    </div>
  );
};
