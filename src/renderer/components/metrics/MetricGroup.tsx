import type { FC } from 'react';

import {
  CommentIcon,
  IssueOpenedIcon,
  MilestoneIcon,
  SmileyIcon,
  TagIcon,
} from '@primer/octicons-react';

import { useAppContext } from '../../hooks/useAppContext';

import { type GitifyNotification, IconColor } from '../../types';

import { getPullRequestReviewIcon } from '../../utils/icons';
import { MetricPill } from './MetricPill';

export interface MetricGroupProps {
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
        linkedIssues.length > 1 ? 'issues:' : 'issue'
      } ${linkedIssues.join(', ')}`
    : '';

  const reactionCount = notification.subject.reactionsCount ?? 0;
  const reactionGroups = notification.subject.reactionGroups ?? [];
  const hasReactions = reactionCount > 0;
  const hasMultipleReactions =
    reactionGroups.filter((rg) => rg.reactors.totalCount > 0).length > 1;
  const reactionPillDescription = hasReactions
    ? `${reactionCount} ${
        reactionCount > 1 ? 'reactions' : 'reaction'
      }: ${reactionGroups
        .reduce((acc, rg) => {
          if (!rg.reactors.totalCount || rg.reactors.totalCount <= 0) {
            return acc;
          }

          let emoji = '';
          switch (rg.content) {
            case 'THUMBS_UP':
              emoji = '👍';
              break;
            case 'THUMBS_DOWN':
              emoji = '👎';
              break;
            case 'LAUGH':
              emoji = '😆';
              break;
            case 'HOORAY':
              emoji = '🎉';
              break;
            case 'CONFUSED':
              emoji = '😕';
              break;
            case 'ROCKET':
              emoji = '🚀';
              break;
            case 'EYES':
              emoji = '👀';
              break;
            case 'HEART':
              emoji = '❤️';
              break;
            default:
              return acc;
          }
          acc.push(
            `${emoji} ${hasMultipleReactions ? rg.reactors.totalCount : ''}`.trim(),
          );
          return acc;
        }, [] as string[])
        .join(' ')}`
    : '';

  const commentCount = notification.subject.commentCount ?? 0;
  const hasComments = commentCount > 0;
  const commentsPillDescription = hasComments
    ? `${notification.subject.commentCount} ${notification.subject.commentCount > 1 ? 'comments' : 'comment'}`
    : '';

  const labels = notification.subject.labels ?? [];
  const labelsCount = labels.length;
  const hasLabels = labelsCount > 0;
  const labelsPillDescription = hasLabels
    ? `${labelsCount} ${labelsCount > 1 ? 'labels' : 'label'}: ${labels.map((label) => `🏷️ ${label}`).join(', ')}`
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

        {hasReactions && (
          <MetricPill
            color={IconColor.GRAY}
            icon={SmileyIcon}
            metric={notification.subject.reactionsCount}
            title={reactionPillDescription}
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
            color={
              milestone.state === 'OPEN' ? IconColor.GREEN : IconColor.PURPLE
            }
            icon={MilestoneIcon}
            title={milestone.title}
          />
        )}
      </div>
    )
  );
};
