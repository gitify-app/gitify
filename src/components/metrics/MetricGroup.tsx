import type { FC } from 'react';

import {
  CommentIcon,
  IssueOpenedIcon,
  MilestoneIcon,
  TagIcon,
} from '@primer/octicons-react';

import { useAppContext } from '../../context/App';
import { type GitifyNotification, IconColor } from '../../types';
import { getPullRequestReviewIcon } from '../../utils/icons';
import { MetricPill } from './MetricPill';

interface MetricGroupProps {
  notification: GitifyNotification;
}

export const MetricGroup: FC<MetricGroupProps> = ({
  notification,
}: MetricGroupProps) => {
  const { settings } = useAppContext();

  const linkedIssues = notification.subject.linkedIssues ?? [];
  const hasLinkedIssues = linkedIssues.length > 0;
  const linkedIssuesPillDescription = hasLinkedIssues
    ? `Linked to ${
        linkedIssues.length > 1 ? 'issues' : 'issue'
      } ${linkedIssues.join(', ')}`
    : '';

  const commentCount = notification.subject.commentCount ?? 0;
  const hasComments = commentCount > 0;
  const commentsPillDescription = hasComments
    ? `${notification.subject.commentCount} ${
        notification.subject.commentCount > 1 ? 'comments' : 'comment'
      }`
    : '';

  const labels = notification.subject.labels ?? [];
  const hasLabels = labels.length > 0;
  const labelsPillDescription = hasLabels
    ? labels.map((label) => `🏷️ ${label}`).join(', ')
    : '';

  const milestone = notification.subject.milestone;

  return (
    settings.showPills && (
      <div className="flex gap-1">
        {hasLinkedIssues && (
          <MetricPill
            color={IconColor.GRAY}
            icon={IssueOpenedIcon}
            metric={linkedIssues.length}
            title={linkedIssuesPillDescription}
          />
        )}

        {notification.subject.reviews?.map((review) => {
          const icon = getPullRequestReviewIcon(review);
          if (!icon) {
            return null;
          }

          return (
            <MetricPill
              color={icon.color}
              icon={icon.type}
              key={review.state}
              metric={review.users.length}
              title={icon.description}
            />
          );
        })}

        {hasComments && (
          <MetricPill
            color={IconColor.GRAY}
            icon={CommentIcon}
            metric={commentCount}
            title={commentsPillDescription}
          />
        )}

        {hasLabels && (
          <MetricPill
            color={IconColor.GRAY}
            icon={TagIcon}
            metric={labels.length}
            title={labelsPillDescription}
          />
        )}

        {milestone && (
          <MetricPill
            color={milestone.state === 'OPEN' ? IconColor.GREEN : IconColor.RED}
            icon={MilestoneIcon}
            title={milestone.title}
          />
        )}
      </div>
    )
  );
};
